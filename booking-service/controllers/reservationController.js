const mongoose = require("mongoose");
const EventInventoryService = require("../lib/EventInventoryService");
const ReservationService = require("../lib/ReservationService");

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
    for (const ticket of tickets) {
      await EventInventoryService.updateInventoryOnReservation(
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

