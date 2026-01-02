const express = require("express");
const { getMovie, addMovie, updateMovie } = require("../controllers/movieController");

const movieRouter = express.Router();

movieRouter.get("/get-movie/:id", getMovie)
movieRouter.post("/add-movie", addMovie)
movieRouter.patch("/update-movie/:id", updateMovie)

