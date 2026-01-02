const express = require("express");
const {
  checkorganization,
  createorganization,
  createEvent,
  getEvents,
  getAllDrafts,
  getEventById,
  updateEvent,
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
organizationrouter.get(
  "/get-drafts/:organizationId",
  verifyToken,
  getAllDrafts
);
organizationrouter.get("/get-event/:eventId", verifyToken, getEventById);
organizationrouter.put("/update-event/:eventId", verifyToken, updateEvent);

module.exports = organizationrouter;
