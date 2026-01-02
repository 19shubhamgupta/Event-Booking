const express = require("express");
const {
  getScreen,
  addScreen,
  updateScreen,
  getScreensByTheater,
} = require("../controllers/screenController");

const screenRouter = express.Router();

screenRouter.get("/get-screen/:id", getScreen);
screenRouter.post("/add-screen", addScreen);
screenRouter.patch("/update-screen/:id", updateScreen);
screenRouter.get("/get-screens-by-theater/:theaterId", getScreensByTheater);

module.exports = screenRouter;
