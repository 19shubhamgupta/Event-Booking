const Show = require("../models/show");

exports.getShow = async (req, res) => {
  try {
    const showId = req.params.id;
    if (!showId)
      return res.status(404).json({ message: "Show ID is required" });
    const show = await Show.findById(showId)
      .populate("movieId")
      .populate("theatreId")
      .populate("screenId");
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.status(200).json(show);
  } catch (error) {
    console.error("Error fetching show:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.addShow = async (req, res) => {
  try {
    const showData = req.body;
    if (!showData) res.status(404).json({ message: "Show data is required" });
    const newShow = new Show(showData);
    await newShow.save();
    res.status(201).json(newShow);
  } catch (error) {
    console.error("Error adding show:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateShow = async (req, res) => {
  try {
    const showData = req.body;
    const showId = req.params.id;
    const ALLOWED_FIELDS = [
      "movieId",
      "theatreId",
      "screenId",
      "showTime",
      "endTime",
      "showDate",
    ];
    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (showData[field] !== undefined) {
        updates[field] = showData[field];
      }
    }

    const updatedShow = await Show.findByIdAndUpdate(
      {
        _id: showId,
      },
      {
        $set: updates,
      },
      { new: true }
    );
    if (!updatedShow)
      return res.status(404).json({ message: "Show not found" });
    res.status(200).json({ message: "Show updated successfully", updatedShow });
  } catch (error) {
    console.error("Error updating show:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getShowsByMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    if (!movieId)
      return res.status(404).json({ message: "Movie ID is required" });
    const shows = await Show.find({ movieId })
      .populate("theatreId")
      .populate("screenId");
    res.status(200).json(shows);
  } catch (error) {
    console.error("Error fetching shows:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getShowsByTheater = async (req, res) => {
  try {
    const theaterId = req.params.theaterId;
    if (!theaterId)
      return res.status(404).json({ message: "Theater ID is required" });
    const shows = await Show.find({ theatreId: theaterId })
      .populate("movieId")
      .populate("screenId");
    res.status(200).json(shows);
  } catch (error) {
    console.error("Error fetching shows:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getShowsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const shows = await Show.find({
      showDate: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("movieId")
      .populate("theatreId")
      .populate("screenId");
    res.status(200).json(shows);
  } catch (error) {
    console.error("Error fetching shows:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
