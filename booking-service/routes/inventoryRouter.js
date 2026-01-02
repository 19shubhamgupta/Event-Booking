const express = require("express");
const {
  postCreateInventory,
  getInventoryByEventId,
  getBookingDatesByEventId,
  updateInventory,
} = require("../controllers/inventoryController");
const {
  verifyToken,
} = require("../../payment-service/middlewares/verifyToken");

const inventoryRouter = express.Router();

inventoryRouter.post("/create-inventory", verifyToken, postCreateInventory);
inventoryRouter.get(
  "/get-inventory/:eventId",
  verifyToken,
  getInventoryByEventId
);
inventoryRouter.get(
  "/booking-dates/:eventId",
  verifyToken,
  getBookingDatesByEventId
);
inventoryRouter.put("/update-inventory/:eventId", verifyToken, updateInventory);

module.exports = inventoryRouter;
