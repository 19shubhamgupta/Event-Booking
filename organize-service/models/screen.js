const mongoose = require("mongoose");

// Seat schema for individual seats
const seatSchema = new mongoose.Schema(
  {
    seatName: {
      type: String,
      required: true, // e.g., "A1", "B5", "K12" or "SPACER-..."
    },
    type: {
      type: String,
      enum: ["regular", "premium", "vip", "spacer"],
      required: true,
      default: "regular",
    },
    available: {
      type: Boolean,
      default: true,
    },
    row: {
      type: Number,
      required: true, // Row index (0, 1, 2, ...)
    },
    position: {
      type: Number,
      required: true, // Position/column in the row (0, 1, 2, ...)
    },
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    screenName: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    seats: {
      type: [seatSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Screen", screenSchema);
