const Movie = require("../models/movie");

exports.getMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    if (!movieId)
      return res.status(404).json({ message: "Movie ID is required" });
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.status(200).json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.addMovie = async (req, res) => {
  try {
    const movieData = req.body;
    if (!movieData) res.status(404).json({ message: "Movie data is required" });
    const newMovie = new Movie(movieData);
    await newMovie.save();
    res.status(201).json(newMovie);
  } catch (error) {
    console.error("Error adding movie:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const movieData = req.body;
    const movieId = req.params.id;
    const ALLOWED_FIELDS = [
      "title",
      "genre",
      "duration",
      "language",
      "rating",
      "releaseDate",
      "cast",
      "director",
      "posterUrl",
      "trailerUrl",
      "status",
    ];
    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (movieData[field] !== undefined) {
        updates[field] = movieData[field];
      }
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      {
        _id: movieId,
      },
      {
        $set: updates,
      },{ new: true }
    );
    if (!updatedMovie)
      return res.status(404).json({ message: "Movie not found" });
    res.status(200).json({ message: "Movie updated successfully" , updatedMovie });  
  } catch (error) {
    console.error("Error updating movie:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



