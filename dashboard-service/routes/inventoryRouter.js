const express = require("express");
const {
  getInventoriesByQuery,
  getInventoryById,
} = require("../controllers/inventoryControllers");
const { verifyToken } = require("../middlewares/verifyToken");

const inventoryRouter = express.Router();

inventoryRouter.get("/get-event-inventory", verifyToken, getInventoriesByQuery);
inventoryRouter.get("/get-inventory-by-id/:inventoryId" , verifyToken, getInventoryById);

module.exports = inventoryRouter;
