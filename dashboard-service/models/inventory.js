const mongoose = require("mongoose");

// Sub-schema for ticket types with inventory details
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

// Sub-schema for booking statistics
const bookingStatsSchema = new mongoose.Schema(
  {
    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    confirmedBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    cancelledBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    netRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

// Main inventory schema for dashboard
const inventorySchema = new mongoose.Schema(
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

    // Event basic details
    eventTitle: {
      type: String,
      required: true,
    },
    eventCategory: String,
    eventStatus: {
      type: String,
      enum: [
        "draft",
        "scheduled",
        "booking_open",
        "sold_out",
        "booking_closed",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    location: {
      city: String,
      state: String,
      country: String,
    },

    // Ticket inventory details
    ticketTypes: {
      type: [ticketTypeSchema],
      default: [],
    },

    // Aggregate inventory stats
    totalCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAvailable: {
      type: Number,
      default: 0,
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

    // Booking settings
    bookingSettings: {
      maxTicketsPerBooking: {
        type: Number,
        default: 10,
        min: 1,
      },
      bookingOpenDate: Date,
      bookingCloseDate: Date,
      isBookingOpen: {
        type: Boolean,
        default: false,
      },
    },

    // Booking and revenue statistics
    bookingStats: {
      type: bookingStatsSchema,
      default: () => ({}),
    },

    // Reservation tracking
    activeReservations: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Last sync/update timestamps
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
inventorySchema.index({ organizationId: 1, eventStatus: 1 });
inventorySchema.index({ eventStatus: 1, startDate: 1 });
inventorySchema.index({ organizationId: 1, isSoldOut: 1 });
inventorySchema.index({ "bookingSettings.isBookingOpen": 1 });

// Virtual for ticket sales percentage
inventorySchema.virtual("salesPercentage").get(function () {
  if (this.totalCapacity === 0) return 0;
  return ((this.totalSold / this.totalCapacity) * 100).toFixed(2);
});

module.exports = mongoose.model("Inventory", inventorySchema);
