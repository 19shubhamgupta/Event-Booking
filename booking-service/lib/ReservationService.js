const mongoose = require("mongoose");
const Reservation = require("../models/reservation");

class ReservationService {
  // Get reservation by ID
  async getReservationById(reservationId, session = null) {
    try {
      const query = { _id: reservationId };

      const queryBuilder = Reservation.findOne(query);

      if (session) {
        queryBuilder.session(session);
      }

      const reservation = await queryBuilder;
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

  // Get reservations by status
  async getReservationsByStatus(status, session) {
    try {
      const reservations = await Reservation.find({ status: status }).session(
        session
      );
      if (!reservations) {
        throw new Error(
          `No reservations found with the given status : ['${status}']`
        );
      }
      return reservations;
    } catch (error) {
      console.error("Error fetching reservations by status:", error);
      throw error;
    }
  }

  // Get expired reservations for cleanup (cron job)
  async getExpiredReservations(session) {
    try {
      const expiredReservations = await Reservation.find({
        status: "active",
        expiresAt: { $lt: new Date() },
      })
        .limit(50) // Process in batches
        .session(session);

      return expiredReservations;
    } catch (error) {
      console.error("Error fetching expired reservations:", error);
      throw error;
    }
  }

  // Update reservation status (called within transaction)
  async updateReservationStatus(reservationId, currStatus, newStatus, session) {
    try {
      const reservation = await Reservation.findOneAndUpdate(
        {
          _id: reservationId,
          status: currStatus, // guard condition
        },
        {
          $set: {
            status: newStatus,
            updatedAt: new Date(),
          },
        },
        {
          new: true, // return updated document
          session, // participate in transaction
        }
      );

      if (!reservation) {
        throw new Error(`Reservation not found or status is not ${currStatus}`);
      }

      return reservation;
    } catch (error) {
      console.error("Error updating reservation status:", error);
      throw error;
    }
  }
}

module.exports = new ReservationService();
