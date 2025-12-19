const express = require("express");
const {
  checkorganization,
  createorganization,
  createEvent
} = require("../controllers/organizationController");
const { checkUser } = require("../middlewares/checkUser");

const organizationrouter = express.Router();

organizationrouter.get("/verify", checkUser, checkorganization);
organizationrouter.post("/create-organization", checkUser, createorganization);
organizationrouter.post("/create-event", checkUser, createEvent);

module.exports = organizationrouter;
