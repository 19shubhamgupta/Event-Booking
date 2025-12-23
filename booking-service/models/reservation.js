const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    userId: String,
    eventId: String,
    tickets: [
      {
        ticketType: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "expired", "booked", "cancelled"],
      default: "active",
      index: true,
    },

    // Expiration
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    // Conversion tracking
    convertedToBookingId: {
      type: String,
      default: null,
    },

    convertedAt: Date,

    // Metadata
    ipAddress: String,
    userAgent: String,

    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  { timestamps: true }
);

reservationSchema.index({ userId: 1, eventId: 1 });
reservationSchema.index({ status: 1, expiresAt: 1 });
reservationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
