const express = require("express");
const {
  postReserveTicket,
  cancelReservationByBack,
} = require("../controllers/reservationController");
const { verifyToken } = require("../middlewares/verifyToken");

const reservationRoter = express.Router();

reservationRoter.post("/create-reservation", verifyToken, postReserveTicket);
reservationRoter.post(
  "/cancel-reservation",
  verifyToken,
  cancelReservationByBack,
);

module.exports = reservationRoter;
