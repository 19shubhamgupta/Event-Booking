const mongoose = require("mongoose");

const userSchemsa = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false, // Not required for Google OAuth users
    },
    profilePicture: {
      type: String,
      default: "/images/defaultProfilePic",
    },
    organizationDetails: {
      type: {
        organizationId: String,
        organizationName: String,
        organizationMail: String,
        phoneNo: Number,
      },
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchemsa);
