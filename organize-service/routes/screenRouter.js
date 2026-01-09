const express = require("express");
const {
  getScreen,
  addScreen,
  updateScreen,
  getScreensByTheater,
} = require("../controllers/screenController");

const { verifyToken } = require("../middlewares/verifyToken");

const screenRouter = express.Router();

screenRouter.get("/get-screen/:id", getScreen);
screenRouter.post("/add-screen",verifyToken , addScreen);
screenRouter.patch("/update-screen/:id",verifyToken , updateScreen);
screenRouter.get("/get-screens-by-theater/:theaterId", getScreensByTheater);

module.exports = screenRouter;
