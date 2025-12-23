const mongoose = require("mongoose");
const EventInventoryService = require("../lib/SeriveClass/EventInventoryService");
const ReservationService = require("../lib/SeriveClass/ReservationService");
const TicketService = require("../lib/SeriveClass/TicketService");
const BookingService = require("../lib/SeriveClass/BookingService");

exports.bookTickets = async (data) => {
  // after sucessfull payment create booking , tickets , update inventory
  let session = null;

  try {
    // Validate required payment data
    if (!data.paymentId) {
      throw new Error("Payment ID is required");
    }
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
      // error hence have to refund money too
      throw new Error("No reservation found");
    }

    // Check if reservation is active and not expired
    if (resv.status !== "active") {
      throw new Error(`Cannot book reservation with status: ${resv.status}`);
    }

    //update inventory - move from reserved to sold
    for (const t of resv.tickets) {
      await EventInventoryService.updateInventoryOnBooking(
        resv.eventId,
        t.ticketType,
        t.quantity,
        session
      );
    }

    //update reservation
    await ReservationService.updateReservationStatus(
      resv._id,
      "active",
      "booked",
      session
    );

    //generate tickets - create individual tickets based on quantity
    const createdTicketIds = [];
    for (const t of resv.tickets) {
      // Create multiple ticket documents based on quantity
      for (let i = 0; i < t.quantity; i++) {
        const ticketData = {
          userId: resv.userId,
          eventId: resv.eventId,
          ticketType: t.ticketType,
          price: t.price,
          seatNumber: resv.seatNumber || null,
          qrCodeUrl: "",
          status: "active",
        };
        const ticket = await TicketService.createTicket(ticketData, session);
        createdTicketIds.push(ticket._id.toString());
      }
    }

    //create booking
    const totalTicketPrice = resv.tickets.reduce(
      (totalAmount, t) => (totalAmount += t.quantity * t.price),
      0
    );
    const totalTickets = resv.tickets.reduce(
      (totalT, t) => (totalT += t.quantity),
      0
    );
    const bookingData = {
      userId: resv.userId,
      eventId: resv.eventId,
      reservationId: data.reservationId,
      ticketIds: createdTicketIds,
      tickets: resv.tickets,
      totalAmount: totalTicketPrice,
      totalTickets,
      paymentId: data.paymentId,
      idempotencyKey:
        data.idempotencyKey || `${data.reservationId}-${Date.now()}`,
    };

    const booking = await BookingService.createBooking(
      bookingData,
      session
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      booking,
      message: "Booking created successfully",
    };
  } catch (error) {
    console.error("Error in bookTickets:", error);

    // Rollback transaction if it exists
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    throw error;
  }
};
