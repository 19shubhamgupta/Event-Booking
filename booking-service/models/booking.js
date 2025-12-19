const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },

  eventId: {
    type: String,
    required: true,
    index: true,
  },

  reservationId: {
    type: String,
    required: true,
  },
  
  // Reference to actual ticket documents
  ticketIds: [{
    type: String,
    ref: 'Ticket'
  }],
  
  totalTickets: {
    type: Number,
    required: true,
    min: 1
  },
  
  tickets: [
    {
      ticketType: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
    totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
   paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
    index: true
  },
   paidAt: Date,

    
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Cancellation details
  cancelledAt: Date,
  cancellationReason: String,
  
  // Refund details
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  refundedAt: Date,
  refundId: String,

  idempotencyKey: {
  type: String,
  unique: true,
  sparse: true,
  index: true
}
  
}, { timestamps: true });

bookingSchema.index({ userId: 1, eventId: 1 });
bookingSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);