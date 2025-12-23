const booking = require("../../models/booking");

class BookingService {
  // get booking by Id
  async getBookingById(bookingId, session = null) {
    try {
      if (!bookingId) {
        throw new Error("Booking ID is required");
      }

      const queryBuilder = booking.findById(bookingId);

      // Add session if provided (for transaction consistency)
      if (session) {
        queryBuilder.session(session);
      }

      const foundBooking = await queryBuilder;

      if (!foundBooking) {
        throw new Error("Booking not found");
      }

      return foundBooking;
    } catch (error) {
      console.error("Error finding booking:", error);
      throw error;
    }
  }

  // create booking
  async createBooking(data, session) {
    const newBooking = new booking({
      userId: data.userId,
      eventId: data.eventId,
      reservationId: data.reservationId,
      ticketIds: data.ticketIds || [],
      totalTickets: data.totalTickets,
      tickets: data.tickets.map((t) => ({
        ticketType: t.ticketType,
        quantity: t.quantity,
        price: t.price,
      })),
      totalAmount: data.totalAmount,
      paymentId: data.paymentId,
      paymentStatus: "completed",
      paidAt: new Date(),
      status: "confirmed",
      idempotencyKey: data.idempotencyKey,
    });

    const savedBooking = await newBooking.save({ session });
    return savedBooking;
  }
}

module.exports = new BookingService();
