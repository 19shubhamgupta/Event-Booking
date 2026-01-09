const mongoose = require('mongoose');

const showschema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
    },
    movieName: {
        type: String,
        required: true,
    },
    theatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre',
        required: true,
    },
    screenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen',
        required: true,
    },
    showTime: {
        type: String,
        required: true,        
    },
    endTime: {
        type: String,
        required: true,
    },
    showDate: {
        type: Date,
        required: true,
    },
    showStatus: {
        type: String,
        enum: ['draft', 'scheduled', 'booking_open', 'sold_out', 'booking_closed', 'cancelled'],
        required: true,
    },
    bookingOpenDate: {
        type: Date,
    },
    bookingCloseDate: {
        type: Date,
    },
})

module.exports = mongoose.model('Show', showschema);