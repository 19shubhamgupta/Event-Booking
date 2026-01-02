const Screen = require("../models/screen");
const Theater = require("../models/theatre");

exports.getScreen = async (req, res) => {
  try {
    const screenId = req.params.id;
    if (!screenId)
      return res.status(404).json({ message: "Screen ID is required" });
    const screen = await Screen.findById(screenId).populate("theaterId");
    if (!screen) return res.status(404).json({ message: "Screen not found" });
    res.status(200).json(screen);
  } catch (error) {
    console.error("Error fetching screen:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.addScreen = async (req, res) => {
  try {
    const screenData = req.body;
    if (!screenData)
      res.status(404).json({ message: "Screen data is required" });
    const newScreen = new Screen(screenData);
    await newScreen.save();

    // Add screen reference to theater
    if (screenData.theaterId) {
      await Theater.findByIdAndUpdate(screenData.theaterId, {
        $push: { screens: newScreen._id },
      });
    }

    res.status(201).json(newScreen);
  } catch (error) {
    console.error("Error adding screen:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateScreen = async (req, res) => {
  try {
    const screenData = req.body;
    const screenId = req.params.id;
    const ALLOWED_FIELDS = ["screenName", "capacity", "seatLayout"];
    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (screenData[field] !== undefined) {
        updates[field] = screenData[field];
      }
    }

    const updatedScreen = await Screen.findByIdAndUpdate(
      {
        _id: screenId,
      },
      {
        $set: updates,
      },
      { new: true }
    );
    if (!updatedScreen)
      return res.status(404).json({ message: "Screen not found" });
    res
      .status(200)
      .json({ message: "Screen updated successfully", updatedScreen });
  } catch (error) {
    console.error("Error updating screen:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getScreensByTheater = async (req, res) => {
  try {
    const theaterId = req.params.theaterId;
    if (!theaterId)
      return res.status(404).json({ message: "Theater ID is required" });
    const screens = await Screen.find({ theaterId });
    res.status(200).json(screens);
  } catch (error) {
    console.error("Error fetching screens:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
