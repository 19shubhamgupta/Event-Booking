const express = require("express");
const {
  getTheater,
  addTheater,
  updateTheater,
  getTheatersByOrganization,
} = require("../controllers/theaterController");

const { verifyToken } = require("../middlewares/verifyToken");

const theaterRouter = express.Router();

theaterRouter.get("/get-theater/:id", getTheater);
theaterRouter.post("/add-theater",verifyToken , addTheater);
theaterRouter.patch("/update-theater/:id",verifyToken , updateTheater);
theaterRouter.get(
  "/get-theaters-by-organization/:organizationId",
  getTheatersByOrganization
);

module.exports = theaterRouter;
