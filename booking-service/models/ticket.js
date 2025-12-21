const mongoose = require('mongoose');


const ticketSchema = new mongoose.Schema({
  
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  eventId: {
    type: String,
    required: true,
    index: true
  },
  ticketType: {
    type: String,
    required: true
  },
  
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  seatNumber: {
    type: String,
    default: null // For assigned seating
  },

  qrCodeUrl: String,

  // Status tracking
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled', 'refunded'],
    default: 'active',
    index: true
  },

});

ticketSchema.index({userId : 1 , eventId : 1, status : 1})


module.exports = mongoose.model('Ticket', ticketSchema);