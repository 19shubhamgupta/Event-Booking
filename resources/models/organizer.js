const mongoose = require("mongoose");

const organizerSchema = mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
    unique : true,
  },
  organizationMail: {
    type: String,
    required: true,
    unique : true,
  },
  drafts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Page" }],
  phoneNo : {
    type : Number,
    required : true,
    unique : true,
    maxLength : 10,
  },
  events : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Event'
  }
});


module.exports = mongoose.model('Organization' , organizerSchema)