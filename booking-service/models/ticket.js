const mongoose = require('mongoose');
const crypto = require('crypto');


const ticketSchema = new mongoose.Schema({
      bookingId: {
    type: String,
    required: true,
    index: true
  },
  
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
  
  // Attendee information
  attendeeName: {
    type: String,
    required: true,
  },
  
  attendeeEmail: {
    type: String,
    required: true,
  },

  attendeePhone: {
    type: Number,
    length: 10,
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


module.exports = mongoose.model('Ticket', ticketSchema);