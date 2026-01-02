const mongoose = require('mongoose');

const showschema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
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
    

})

module.exports = mongoose.model('Show', showschema);