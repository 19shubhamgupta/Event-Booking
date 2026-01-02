const express = require("express");
const {
  getShow,
  addShow,
  updateShow,
  getShowsByMovie,
  getShowsByTheater,
  getShowsByDate,
} = require("../controllers/showController");

const showRouter = express.Router();

showRouter.get("/get-show/:id", getShow);
showRouter.post("/add-show", addShow);
showRouter.patch("/update-show/:id", updateShow);
showRouter.get("/get-shows-by-movie/:movieId", getShowsByMovie);
showRouter.get("/get-shows-by-theater/:theaterId", getShowsByTheater);
showRouter.get("/get-shows-by-date", getShowsByDate);

module.exports = showRouter;
