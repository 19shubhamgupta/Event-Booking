const mongoose = require("mongoose");

const ticketTypeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
    availableTickets: {
      type: Number,
      required: true,
      min: 0,
    },
    reservedTickets: {
      type: Number,
      default: 0,
      min: 0,
    },
    soldTickets: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: String,
  },
  { _id: false }
);

const eventInventorySchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    ticketTypes: {
      type: [ticketTypeSchema],
      required: true,
      validate: {
        validator: function (array) {
          return array.length > 0;
        },
        message: "At least one ticket type is required",
      },
    },
    totalCapacity: {
      type: Number,
      required: true,
      min: 1,
    },

    totalAvailable: {
      type: Number,
      required: true,
      min: 0,
    },

    totalReserved: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSold: {
      type: Number,
      default: 0,
      min: 0,
    },

    isSoldOut: {
      type: Boolean,
      default: false,
    },

    bookingSettings: {
      maxTicketsPerBooking: {
        type: Number,
        default: 10,
        min: 1,
        max: 20,
      },
      bookingOpenDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
      bookingCloseDate: {
        type: Date,
        required: true,
      },
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true, // Enables __v for race condition prevention
  }
);

// Pre-save validation to prevent data corruption
eventInventorySchema.pre("save", function (next) {
  // Validate each ticket type
  for (const ticket of this.ticketTypes) {
    // Check for negative numbers
    if (ticket.availableTickets < 0) {
      return next(
        new Error(`${ticket.type}: Available tickets cannot be negative`)
      );
    }
    if (ticket.reservedTickets < 0) {
      return next(
        new Error(`${ticket.type}: Reserved tickets cannot be negative`)
      );
    }
    if (ticket.soldTickets < 0) {
      return next(new Error(`${ticket.type}: Sold tickets cannot be negative`));
    }

    // Check total doesn't exceed capacity
    const total =
      ticket.availableTickets + ticket.reservedTickets + ticket.soldTickets;
    if (total > ticket.totalCapacity) {
      return next(
        new Error(
          `${ticket.type}: Total (${total}) exceeds capacity (${ticket.totalCapacity})`
        )
      );
    }
  }

  next();
});

/*
// ATOMIC OPERATION: Reserve tickets (prevents double booking)
eventInventorySchema.statics.reserveTicketsAtomic = async function (
  eventId,
  ticketType,
  quantity
) {
  const result = await this.findOneAndUpdate(
    {
      eventId: eventId,
      "ticketTypes.type": ticketType,
      "ticketTypes.availableTickets": { $gte: quantity }, // Only if enough available
    },
    {
      $inc: {
        "ticketTypes.$.availableTickets": -quantity,
        "ticketTypes.$.reservedTickets": quantity,
        totalAvailable: -quantity,
        totalReserved: quantity,
      },
    },
    { new: true }
  );

  if (!result) {
    throw new Error("Insufficient tickets available");
  }

  // Check if sold out
  if (result.totalAvailable === 0) {
    result.isSoldOut = true;
    await result.save();
  }

  return result;
};

// ATOMIC OPERATION: Confirm sale (reservation → sold)
eventInventorySchema.statics.confirmSaleAtomic = async function (
  eventId,
  ticketType,
  quantity
) {
  const result = await this.findOneAndUpdate(
    {
      eventId: eventId,
      "ticketTypes.type": ticketType,
      "ticketTypes.reservedTickets": { $gte: quantity },
    },
    {
      $inc: {
        "ticketTypes.$.reservedTickets": -quantity,
        "ticketTypes.$.soldTickets": quantity,
        totalReserved: -quantity,
        totalSold: quantity,
      },
    },
    { new: true }
  );

  if (!result) {
    throw new Error("Reservation not found or insufficient reserved tickets");
  }

  return result;
};

// ATOMIC OPERATION: Release expired reservations
eventInventorySchema.statics.releaseReservedAtomic = async function (
  eventId,
  ticketType,
  quantity
) {
  const result = await this.findOneAndUpdate(
    {
      eventId: eventId,
      "ticketTypes.type": ticketType,
      "ticketTypes.reservedTickets": { $gte: quantity },
    },
    {
      $inc: {
        "ticketTypes.$.reservedTickets": -quantity,
        "ticketTypes.$.availableTickets": quantity,
        totalReserved: -quantity,
        totalAvailable: quantity,
      },
      $set: { isSoldOut: false },
    },
    { new: true }
  );

  if (!result) {
    throw new Error("Failed to release reserved tickets");
  }

  return result;
};

// ATOMIC OPERATION: Cancel booking (sold → available)
eventInventorySchema.statics.cancelBookingAtomic = async function (
  eventId,
  ticketType,
  quantity
) {
  const result = await this.findOneAndUpdate(
    {
      eventId: eventId,
      "ticketTypes.type": ticketType,
      "ticketTypes.soldTickets": { $gte: quantity },
    },
    {
      $inc: {
        "ticketTypes.$.soldTickets": -quantity,
        "ticketTypes.$.availableTickets": quantity,
        totalSold: -quantity,
        totalAvailable: quantity,
      },
      $set: { isSoldOut: false },
    },
    { new: true }
  );

  if (!result) {
    throw new Error("Failed to cancel booking");
  }

  return result;
};
*/
module.exports = mongoose.model("EventInventory", eventInventorySchema);
