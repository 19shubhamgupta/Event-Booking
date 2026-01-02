const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      required: true,
      unique: true, // central identifier used across services
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    genre: {
      type: [String],
      required: true,
    },

    duration: {
      type: Number, // in minutes
      required: true,
      min: 1,
    },

    language: {
      type: [String],
      required: true,
    },

    rating: {
      type: String,
      enum: ["U", "UA", "A", "S"],
      required: true,
    },

    releaseDate: {
      type: Date,
      required: true,
    },

    cast: {
      type: [String],
      default: [],
    },

    director: {
      type: String,
      trim: true,
    },

    posterUrl: {
      type: String,
      required: true,
    },

    trailerUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: ["upcoming", "now_showing", "archived"],
      default: "upcoming",
      index: true,
    },

    addedBy: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Page",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
  }
);

module.exports = mongoose.model("Movie", movieSchema);
