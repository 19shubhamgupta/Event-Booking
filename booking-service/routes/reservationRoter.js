const express = require("express");

const reservationRoter = express.Router();

reservationRoter.post('/reserve-ticket', postReserveTicket)

module.exports = reservationRoter;