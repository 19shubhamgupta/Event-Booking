const express = require("express");
const {
  checkorganization,
  createorganization,
  createEvent,
  putPublishEvent,
  getEvents,
} = require("../controllers/organizationController");
const { verifyToken } = require("../middlewares/verifyToken");

const organizationrouter = express.Router();

organizationrouter.get("/verify", verifyToken, checkorganization);
organizationrouter.get("/events", verifyToken, getEvents);
organizationrouter.post(
  "/create-organization",
  verifyToken,
  createorganization
);
organizationrouter.post("/create-event", verifyToken, createEvent);
organizationrouter.put("/publish-event/:id", verifyToken, putPublishEvent);

module.exports = organizationrouter;
