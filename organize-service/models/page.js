const mongoose = require("mongoose");

// Block sub-schema (optional, for better validation)
const blockSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["text", "image", "video", "button", "columns", "hero"], // Allowed types
    },
    props: {
      type: Object,
      default: {},
    },
    children: {
      type: Array,
      default: [],
    },
  },
  { _id: false }
); // Don't create _id for sub-documents

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    // Unique slug
    slug: {
      type: String,
      required: true,
      unique: true, // MongoDB creates an index for this
      lowercase: true, // Auto-convert to lowercase
      trim: true,
      match: [
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase, numbers, and hyphens",
      ],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId, // Special type for IDs
      ref: "Organizer", // Name of the model to reference
      required: true,
    },
    blocks: {
      type : [blockSchema],
      default : []
    },
  },
  {
    timestamps: true,
  }
);

// Instance method (called on a single document)
pageSchema.methods.generateSlug = function () {
  // 'this' refers to the page document
  return this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with -
    .replace(/^-|-$/g, ""); // Remove leading/trailing -
};

// Static method (called on the Model itself)
pageSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, published: true });
};

module.exports = mongoose.model("Page", pageSchema);
