const express = require("express");
const { postCreateInventory , getInventoryByEventId} = require("../controllers/inventoryController");
const { verifyToken } = require("../../payment-service/middlewares/verifyToken");

const inventoryRouter = express.Router();

inventoryRouter.post('/create-inventory' , verifyToken, postCreateInventory)
inventoryRouter.get('/get-inventory/:eventId' , verifyToken, getInventoryByEventId)


module.exports = inventoryRouter;