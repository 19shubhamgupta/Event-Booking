const mongoose = require("mongoose");
const EventInventoryService = require("../lib/SeriveClass/EventInventoryService");
const ReservationService = require("../lib/SeriveClass/ReservationService");
const kafkaProducer = require("../lib/kafkaProducer");

exports.postReserveTicket = async (req, res) => {
  const { eventId, tickets } = req.body;
  const userId = req.user.userId; // From auth middleware

  // Validate input
  if (!eventId || !tickets || tickets.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Event ID and tickets are required",
    });
  }

  // MongoDB multi-document transactions throw TransientTransactionError
  // ("Write conflict during plan execution") when concurrent requests touch
  // the same inventory document. Retry with backoff like the driver expects.
  const MAX_ATTEMPTS = 5;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const session = await mongoose.startSession();
    let result;
    let reservation;
    try {
      session.startTransaction();

      // Resolve ticket prices from inventory (server-side, never trust client)
      const inventory = await EventInventoryService.getInventoryByEventId(
        eventId,
      );
      if (!inventory) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: "Inventory not found for this event",
        });
      }
      const priceMap = {};
      inventory.ticketTypes.forEach((t) => {
        priceMap[t.type.toLowerCase()] = t.price;
      });

      const enrichedTickets = tickets.map((ticket) => {
        const price = priceMap[String(ticket.ticketType).toLowerCase()];
        if (price === undefined) {
          throw new Error(
            `Ticket type "${ticket.ticketType}" not found in inventory`,
          );
        }
        return {
          ticketType: ticket.ticketType,
          quantity: ticket.quantity,
          price,
        };
      });

      //Update inventory first
      for (const ticket of enrichedTickets) {
        result = await EventInventoryService.updateInventoryOnReservation(
          eventId,
          ticket.ticketType,
          ticket.quantity,
          session,
        );
      }

      // 2. Create reservation (only if inventory updates succeeded)
      reservation = await ReservationService.createReservation(
        { userId, eventId, tickets: enrichedTickets },
        session,
      );

      await session.commitTransaction();
      session.endSession();

      // sending event to dashboard service (after successful commit)
      await kafkaProducer.publish("reservation.success", {
        reservation,
      });

      if (result.isSoldOut === true) {
        await kafkaProducer.publish("event.updated", {
          eventId: result.eventId,
          organizationId: result.organizationId,
          eventStatus: "sold_out",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Reservation created successfully",
        reservation: {
          reservationId: reservation._id,
          eventId: reservation.eventId,
          tickets: reservation.tickets,
          expiresAt: reservation.expiresAt,
          status: reservation.status,
        },
      });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      session.endSession();
      lastError = error;

      const transient =
        /write conflict|TransientTransactionError/i.test(error.message || "") ||
        (error.errorLabels &&
          error.errorLabels.includes("TransientTransactionError"));

      if (transient && attempt < MAX_ATTEMPTS) {
        console.warn(
          `Reservation write conflict (attempt ${attempt}/${MAX_ATTEMPTS}), retrying...`,
        );
        await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
        continue;
      }
      break;
    }
  }

  console.error("Error creating reservation:", lastError);
  const statusCode = lastError.message.includes("Insufficient") ? 400 : 500;
  return res.status(statusCode).json({
    success: false,
    message: lastError.message || "Failed to create reservation",
  });
};

exports.cancelReservation = async (data) => {
  // due to unsuccessful payment cancel reservation
  if (!data.reservationId) {
    throw new Error("Reservation ID is required");
  }

  const MAX_ATTEMPTS = 5;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      // Read reservation inside transaction for consistency
      const resv = await ReservationService.getReservationById(
        data.reservationId,
        session,
      );
      if (!resv) {
        throw new Error("No reservation found");
      }

      if (resv.status !== "active") {
        throw new Error(`Cannot cancel reservation with status: ${resv.status}`);
      }
      let result;
      for (const t of resv.tickets) {
        result = await EventInventoryService.updateInventoryOnReservationCancel(
          resv.eventId,
          t.ticketType,
          t.quantity,
          session,
        );
      }

      await ReservationService.updateReservationStatus(
        resv._id,
        "active",
        "cancelled",
        session,
      );

      await session.commitTransaction();
      session.endSession();
      console.log(`✅ Reservation ${resv._id} cancelled successfully`);

      // sending event to dashboard service
      await kafkaProducer.publish("reservation.cancelled", {
        reservation: resv,
      });

      if (
        result.bookingSettings.bookingCloseDate >= new Date() &&
        result.isSoldOut === false &&
        result.eventStatus === "sold_out"
      ) {
        await kafkaProducer.publish("event.updated", {
          eventId: result.eventId,
          organizationId: result.organizationId,
          eventStatus: "booking_open",
        });
      }

      return {
        success: true,
        message: "Reservation cancelled successfully",
      };
    } catch (error) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      if (session) {
        session.endSession();
      }
      lastError = error;

      const transient =
        /write conflict|TransientTransactionError/i.test(error.message || "") ||
        (error.errorLabels &&
          error.errorLabels.includes("TransientTransactionError"));

      if (transient && attempt < MAX_ATTEMPTS) {
        console.warn(
          `Cancel write conflict (attempt ${attempt}/${MAX_ATTEMPTS}), retrying...`,
        );
        await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
        continue;
      }
      break;
    }
  }

  console.error("Error cancelling reservation:", lastError);
  throw lastError;
};

exports.cancelReservationByBack = async (req, res) => {
  try {
    const { reservationId } = req.body;
    await exports.cancelReservation({ reservationId });

    return res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling reservation via backend:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel reservation",
    });
  }
};
