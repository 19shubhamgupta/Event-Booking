const kafkaProducer = require("../lib/kafkaProducer");
const screen = require("../models/screen");
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
    showData.showStatus = "draft";

    // If movieId is not a valid ObjectId, remove it (keep only movieName)
    if (showData.movieId && !showData.movieId.match(/^[0-9a-fA-F]{24}$/)) {
      delete showData.movieId;
    }

    const newShow = new Show(showData);
    await newShow.save();
    const onScreen = await screen.findById(newShow.screenId);
    kafkaProducer.publish("event.created", {
      title: `${onScreen.screenName} - ${
        newShow.movieName
      } - ${newShow.showDate.toDateString()} ${newShow.showTime}`,
      eventId: newShow._id,
      organizationId: req.user.organizationId,
      startDate: newShow.showDate,
      endDate: newShow.showDate, // Same as start date for shows
      startTime: newShow.showTime,
      endTime: newShow.endTime,
      eventCategory: "show",
      city: null,
      state: null,
      country: null,
    });
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
      "showStatus",
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

    // Map show fields to event fields for Kafka event
    const eventUpdateData = {
      eventId: updatedShow._id,
    };

    if (updates.showDate !== undefined)
      eventUpdateData.startDate = updates.showDate;
    if (updates.showDate !== undefined)
      eventUpdateData.endDate = updates.showDate;
    if (updates.showTime !== undefined)
      eventUpdateData.startTime = updates.showTime;
    if (updates.endTime !== undefined)
      eventUpdateData.endTime = updates.endTime;
    if (updates.showStatus !== undefined)
      eventUpdateData.eventStatus = updates.showStatus;

    kafkaProducer.publish("event.updated", eventUpdateData);

    if (updates.showStatus === "scheduled") {
      // Populate theatre data to get location
      const populatedShow = await Show.findById(updatedShow._id)
        .populate("theatreId")
        .populate("screenId");

      kafkaProducer.publish("event.scheduled", {
        eventId: populatedShow._id.toString(),
        organizationId: req.user.organizationId,
        title: `${populatedShow.screenId?.screenName || "Screen"} - ${
          populatedShow.movieName
        } - ${populatedShow.showDate.toDateString()} ${populatedShow.showTime}`,
        shortDescription: `${populatedShow.movieName} screening at ${
          populatedShow.theatreId?.theaterName || "Theatre"
        }`,
        startDate: populatedShow.showDate,
        endDate: populatedShow.showDate,
        startTime: populatedShow.showTime,
        endTime: populatedShow.endTime,
        city: "N/A",
        state: "N/A",
        country: "United States",
        eventCategory: "show",
        coverImage: null,
        locationCoordinates: populatedShow.theatreId?.locationCoordinates
          ? {
              longitude: populatedShow.theatreId.locationCoordinates.longitude,
              latitude: populatedShow.theatreId.locationCoordinates.latitude,
            }
          : undefined,
        bookingOpenDate: populatedShow.bookingOpenDate,
        bookingCloseDate: populatedShow.bookingCloseDate,
      });
    }
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

exports.getShowsByMovieAndDateAndTheatre = async (req, res) => {
  try {
    const { movieId, date, theaterId } = req.query;

    // Validate required parameters
    if (!movieId) {
      return res.status(400).json({ message: "Movie ID is required" });
    }
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Parse and validate date
    const startDate = new Date(date);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Build query
    const query = {
      showDate: {
        $gte: startDate,
        $lte: endDate,
      },
      showStatus: "booking_open",
      movieId,
    };

   

    // Fetch shows with populated theatre data
    const shows = await Show.find(query)
      .populate({
        path: "theatreId",
        select: "theaterName locationCoordinates",
      })
      .populate({
        path: "screenId",
        select: "screenName capacity",
      })
      .lean();

    if (!shows || shows.length === 0) {
      return res.status(404).json({
        message: "No shows found for the given criteria",
        data: {},
      });
    }

    // Group shows by theatre
    const groupedShows = {};

    shows.forEach((show) => {
      const theatreId = show.theatreId._id.toString();

      // Initialize theatre group if it doesn't exist
      if (!groupedShows[theatreId]) {
        groupedShows[theatreId] = {
          theatreId: theatreId,
          theatreName: show.theatreId.theaterName,
          locationCoordinates: show.theatreId.locationCoordinates,
          shows: [],
        };
      }

      // Add show to theatre's shows array (without duplicate theatre data)
      groupedShows[theatreId].shows.push({
        _id: show._id,
        movieId: show.movieId,
        movieName: show.movieName,
        screenId: show.screenId?._id,
        screenName: show.screenId?.screenName,
        screenCapacity: show.screenId?.capacity,
        showDate: show.showDate,
        showTime: show.showTime,
        endTime: show.endTime,
        showStatus: show.showStatus,
        bookingOpenDate: show.bookingOpenDate,
        bookingCloseDate: show.bookingCloseDate,
      });
    });

    /* 
 {
  "message": "Shows fetched successfully",
  "count": 5,
  "theatreCount": 2,
  "data": {
    "theatreId1": {
      "theatreId": "...",
      "theatreName": "PVR Cinemas",
      "locationCoordinates": { "latitude": 28.5, "longitude": 77.2 },
      "shows": [
        {
          "_id": "...",
          "movieId": "...",
          "movieName": "Avatar",
          "screenId": "...",
          "screenName": "Screen 1",
          "screenCapacity": 150,
          "showDate": "2026-01-08",
          "showTime": "18:30",
          "endTime": "21:30",
          "showStatus": "booking_open",
          "bookingOpenDate": "...",
          "bookingCloseDate": "..."
        }
      ]
    }
  }
}
 */

    res.status(200).json({
      message: "Shows fetched successfully",
      count: shows.length,
      theatreCount: Object.keys(groupedShows).length,
      data: groupedShows,
    });
  } catch (error) {
    console.error("Error fetching shows by movie, date, and theatre:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
