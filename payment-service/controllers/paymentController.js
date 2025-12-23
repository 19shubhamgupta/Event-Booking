const kafkaProducer = require("../lib/kafkaProducer");

exports.processPayment = async (req, res) => {
  try {
    const { paymentId, paymentStatus, paidAt, reservationId } = req.body;

    const userId = req.user._id || req.user.userId;

    console.log(
      "Payment processing : ",
      paymentId,
      paymentStatus,
      paidAt,
      userId,
      reservationId
    );

    await kafkaProducer.publish("payment.complete", {
      aggregateId: reservationId,
      success: true,
      paymentId,
      paymentStatus,
      paidAt,
      userId,
      reservationId,
    });

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error.message,
    });
  }
};

exports.cancelPayment = async (req, res) => {
  try {
    const { paymentId, paymentStatus, paidAt, reservationId } = req.body;

    const userId = req.user._id || req.user.userId;

    console.log(
      "Payment cancelling : ",
      paymentId,
      paymentStatus,
      paidAt,
      userId,
      reservationId
    );

    await kafkaProducer.publish("payment.complete", {
      aggregateId: reservationId,
      success: false,
      paymentId,
      paymentStatus,
      paidAt,
      userId,
      reservationId,
    });

    return res.status(200).json({
      success: true,
      message: "Payment cancelled successfully",
    });
  } catch (error) {
    console.error("Payment cancellation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel payment",
      error: error.message,
    });
  }
};
