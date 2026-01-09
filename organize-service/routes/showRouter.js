const express = require("express");
const {
  getShow,
  addShow,
  updateShow,
  getShowsByMovie,
  getShowsByTheater,
  getShowsByDate,
  getShowsByMovieAndDateAndTheatre
} = require("../controllers/showController");

const { verifyToken } = require("../middlewares/verifyToken");

const showRouter = express.Router();

showRouter.get("/get-show/:id", getShow);
showRouter.post("/add-show",verifyToken , addShow);
showRouter.patch("/update-show/:id",verifyToken , updateShow);
showRouter.get("/get-shows-by-movie/:movieId", getShowsByMovie);
showRouter.get("/get-shows-by-theater/:theaterId", getShowsByTheater);
showRouter.get("/get-shows-by-date", getShowsByDate);
showRouter.get("/get-shows-by-movie-and-date-and-theatre", getShowsByMovieAndDateAndTheatre);

module.exports = showRouter;
