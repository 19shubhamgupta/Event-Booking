const mongoose = require("mongoose");
const EventInventoryService = require("../lib/SeriveClass/EventInventoryService");
const ReservationService = require("../lib/SeriveClass/ReservationService");
const kafkaProducer = require("../lib/kafkaProducer");

exports.postReserveTicket = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, tickets } = req.body;
    const userId = req.user.userId; // From auth middleware

    // Validate input
    if (!eventId || !tickets || tickets.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Event ID and tickets are required",
      });
    }

    //Update inventory first
    let result;
    for (const ticket of tickets) {
      result = await EventInventoryService.updateInventoryOnReservation(
        eventId,
        ticket.ticketType,
        ticket.quantity,
        session
      );
    }

    // 2. Create reservation (only if inventory updates succeeded)
    const reservationData = { userId, eventId, tickets };
    const reservation = await ReservationService.createReservation(
      reservationData,
      session
    );

    await session.commitTransaction();

    // sending event to dashboard service
    await kafkaProducer.publish("reservation.success", {
      reservation,
    });

    if(result.isSoldOut === true){
      await kafkaProducer.publish("event.updated", {
       eventId : result.eventId,
       organizationId : result.organizationId,
       eventStatus :"sold_out",
    });
    };

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
    await session.abortTransaction();
    console.error("Error creating reservation:", error);

    // Send appropriate error message
    const statusCode = error.message.includes("Insufficient") ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create reservation",
    });
  } finally {
    session.endSession();
  }
};

exports.cancelReservation = async (data) => {
  // due to unsuccessful payment cancel reservation
  let session = null;
  try {
    if (!data.reservationId) {
      throw new Error("Reservation ID is required");
    }

    session = await mongoose.startSession();
    session.startTransaction();

    // Read reservation inside transaction for consistency
    const resv = await ReservationService.getReservationById(
      data.reservationId,
      session
    );
    if (!resv) {
      throw new Error("No reservation found");
    }

    if (resv.status !== "active") {
      throw new Error(`Cannot cancel reservation with status: ${resv.status}`);
    }
let result ;
    for (const t of resv.tickets) {
     result  = await EventInventoryService.updateInventoryOnReservationCancel(
        resv.eventId,
        t.ticketType,
        t.quantity,
        session
      );
    }

    await ReservationService.updateReservationStatus(
      resv._id,
      "active",
      "cancelled",
      session
    );

    await session.commitTransaction();
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
    console.error("Error cancelling reservation:", error);
    if (session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

exports.cancelReservationByBack = async (req, res) => {
  try {
    const { reservationId } = req.body;
    await cancelReservation({ reservationId });

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
