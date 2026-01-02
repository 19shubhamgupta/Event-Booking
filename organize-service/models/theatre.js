const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({
    organizationId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    theaterName: {
        tyoe : String,
        required: true
    },
    locationCoordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    screens : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen',
    }
})

module.exports = mongoose.model('Theatre', theatreSchema);