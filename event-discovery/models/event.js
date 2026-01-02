const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    // Reference IDs
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

    // Basic event information
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    shortDescription: {
      type: String,
      trim: true,
    },

    // Date and time
    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    eventStatus: {
      type: String,
      enum: [
        "scheduled",
        "booking_open",
        "sold_out",
        "booking_closed",
        "cancelled",
      ],
      default: "scheduled",
      index: true,
    },

    // Booking dates
    bookingOpenDate: {
      type: Date,
      index: true,
    },

    bookingCloseDate: {
      type: Date,
      index: true,
    },

    // Location information
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "United States",
    },

    // GeoJSON location for geospatial queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (coords) {
            // Validate [longitude, latitude] format
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 &&
              coords[1] >= -90 &&
              coords[1] <= 90
            );
          },
          message: "Invalid coordinates. Must be [longitude, latitude]",
        },
      },
    },

    // Event category
    eventCategory: {
      type: String,
      required: true,
      index: true,
    },

    // Denormalized page data
    page: {
      pageId: {
        type: String,
        required: true,
      },
      slug: {
        type: String,
        required: true,
        index: true,
      },
    },

    // Images
    coverImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
eventSchema.index({ eventStatus: 1, startDate: 1 }); // Upcoming published events
eventSchema.index({ eventCategory: 1, city: 1, startDate: 1 }); // Category + location + date
eventSchema.index({ state: 1, startDate: 1 }); // State-based queries
eventSchema.index({ city: 1, eventCategory: 1 }); // Location + category

// Geospatial index for "near me" queries
eventSchema.index({ location: "2dsphere" });

// Text index for search functionality
eventSchema.index({ title: "text", shortDescription: "text" });

module.exports = mongoose.model("Event", eventSchema);
