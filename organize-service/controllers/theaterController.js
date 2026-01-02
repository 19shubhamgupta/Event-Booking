const Theater = require("../models/theatre");

exports.getTheater = async (req, res) => {
  try {
    const theaterId = req.params.id;
    if (!theaterId)
      return res.status(404).json({ message: "Theater ID is required" });
    const theater = await Theater.findById(theaterId).populate("screens");
    if (!theater) return res.status(404).json({ message: "Theater not found" });
    res.status(200).json(theater);
  } catch (error) {
    console.error("Error fetching theater:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.addTheater = async (req, res) => {
  try {
    const theaterData = req.body;
    if (!theaterData)
      res.status(404).json({ message: "Theater data is required" });
    const newTheater = new Theater(theaterData);
    await newTheater.save();
    res.status(201).json(newTheater);
  } catch (error) {
    console.error("Error adding theater:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateTheater = async (req, res) => {
  try {
    const theaterData = req.body;
    const theaterId = req.params.id;
    const ALLOWED_FIELDS = ["theaterName", "locationCoordinates", "screens"];
    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (theaterData[field] !== undefined) {
        updates[field] = theaterData[field];
      }
    }

    const updatedTheater = await Theater.findByIdAndUpdate(
      {
        _id: theaterId,
      },
      {
        $set: updates,
      },
      { new: true }
    );
    if (!updatedTheater)
      return res.status(404).json({ message: "Theater not found" });
    res
      .status(200)
      .json({ message: "Theater updated successfully", updatedTheater });
  } catch (error) {
    console.error("Error updating theater:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getTheatersByOrganization = async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    if (!organizationId)
      return res.status(404).json({ message: "Organization ID is required" });
    const theaters = await Theater.find({ organizationId }).populate("screens");
    res.status(200).json(theaters);
  } catch (error) {
    console.error("Error fetching theaters:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
