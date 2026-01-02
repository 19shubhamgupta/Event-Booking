const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema({
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
  },
  //seatLayout
  
});
