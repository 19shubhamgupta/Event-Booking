const express = require("express");
const { processPayment , cancelPayment } = require("../controllers/paymentController");
const { verifyToken } = require("../middlewares/verifyToken");

const paymentRouter = express.Router();

paymentRouter.post("/", verifyToken, processPayment); 
paymentRouter.post("/cancel", verifyToken, cancelPayment);

module.exports = paymentRouter;