const express = require("express");
const {
  getTheater,
  addTheater,
  updateTheater,
  getTheatersByOrganization,
} = require("../controllers/theaterController");

const theaterRouter = express.Router();

theaterRouter.get("/get-theater/:id", getTheater);
theaterRouter.post("/add-theater", addTheater);
theaterRouter.patch("/update-theater/:id", updateTheater);
theaterRouter.get(
  "/get-theaters-by-organization/:organizationId",
  getTheatersByOrganization
);

module.exports = theaterRouter;
