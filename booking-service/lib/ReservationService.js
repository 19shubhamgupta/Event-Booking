const mongoose = require("mongoose");
const Reservation = require("../models/reservation");

class ReservationService {

    
  // Get reservation by ID
  async getReservationById(reservationId) {
    try {
      const query = { _id: reservationId };

      const reservation = await Reservation.findOne(query);
      if (!reservation) {
        throw new Error("Reservation not found");
      }
      return reservation;
    } catch (error) {
      console.error("Error fetching reservation:", error);
      throw error;
    }
  }

  // Create reservation document
  async createReservation(reservationData, session) {
    try {
      // 1. Check for existing active reservation (prevent duplicate)
      const existingReservation = await Reservation.findOne({
        userId: reservationData.userId,
        eventId: reservationData.eventId,
        status: "active",
        expiresAt: { $gt: new Date() },
      }).session(session);

      if (existingReservation) {
        console.log(
          `Active reservation already exists for user ${reservationData.userId} on event ${reservationData.eventId}`
        );
        return existingReservation;
      }

      // 2. Calculate expiration time (5 minutes from now)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // 3. Create reservation document
      const reservation = new Reservation({
        userId: reservationData.userId,
        eventId: reservationData.eventId,
        tickets: reservationData.tickets.map((t) => ({
          ticketType: t.ticketType,
          quantity: t.quantity,
          price: t.price,
        })),
        status: "active",
        expiresAt,
        cleanupJobProcessed: false,
      });

      await reservation.save({ session });

      console.log(
        `✅ Reservation created: ${reservation._id} for user ${reservationData.userId}`
      );
      return reservation;
    } catch (error) {
      console.error("Error creating reservation:", error.message);
      throw error;
    }
  }

  // Update reservation status (called within transaction)
  async updateReservationStatus(reservationId, status, session) {
    try {
      const reservation = await Reservation.findById(reservationId).session(
        session
      );
      if (!reservation) {
        throw new Error("Reservation not found");
      }

      reservation.status = status;
      await reservation.save({ session });

      return reservation;
    } catch (error) {
      console.error("Error updating reservation status:", error);
      throw error;
    }
  }
}

module.exports = new ReservationService();
