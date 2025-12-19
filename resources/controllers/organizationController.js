const event = require("../models/event");
const organizer = require("../models/organizer");
const page = require("../models/page");
const user = require("../models/user");

exports.checkorganization = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Checking organization for user:", userId);
    const curruser = await user.findById(userId);
    console.log("checking organization for : ", curruser);
    if (!curruser.organizationId) {
      return res.status(403).json({ message: "No Organization Found" });
    }

    const currOrganization = await organizer.findById(curruser.organizationId);

    if (currOrganization) return res.status(200).json(currOrganization);
    else return res.status(403).json({ message: "No Organization Found" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createorganization = async (req, res) => {
  try {
    const userId = req.user._id;
    const curruser = await user.findById(userId);

    if (user.organizationId) {
      return res.status(400).json({ message: "Organization already exist" });
    }

    const { organizationName, organizationMail, phoneNo } = req.body;
    console.log(req.body);

    const newOrganization = await organizer.create({
      organizationName,
      organizationMail,
      phoneNo,
    });

    if (newOrganization) {
      curruser.organizationId = newOrganization._id;
      await curruser.save();
      return res.status(200).json(newOrganization);
    } else {
      return res.status(500).json({ message: "Error creating Organization" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventData } = req.body;
    console.log("event data in server : ", eventData)

    // Get user's organization
    const curruser = await user.findById(userId);
    if (!curruser.organizationId) {
      return res.status(403).json({ message: "No Organization Found" });
    }

    let pageId = eventData.page; // Default to existing page ID

    if (eventData.newPageName != null) {
      // new page case - create a new page
      const slug = eventData.newPageName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const newPage = await page.create({
        title: eventData.newPageName,
        slug: slug,
        authorId: curruser.organizationId,
        blocks: [],
        published: false,
      });

      pageId = newPage._id; // Use new page ID

      // Add new page to organization's drafts
      await organizer.findByIdAndUpdate(curruser.organizationId, {
        $push: { drafts: newPage._id },
      });
    }

    // Create event with all data fields
    const newEvent = await event.create({
      title: eventData.title,
      shortDescription: eventData.shortDescription,
      eventCategory: eventData.eventCategory,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      city: eventData.city,
      state: eventData.state,
      country: eventData.country,
      locationCoordinates: {
        latitude: eventData.locationCoordinates.latitude,
        longitude: eventData.locationCoordinates.longitude,
      },
      page: pageId, // Reference to page (new or existing)
    });

    return res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
      pageId
    });
  } catch (error) {
    console.log("Error creating event:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
