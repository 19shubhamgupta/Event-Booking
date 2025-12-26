const kafkaProducer = require("../lib/kafkaProducer");
const event = require("../models/event");
const organizer = require("../models/organizer");
const page = require("../models/page");

exports.checkorganization = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Checking organization for user:", req.user);
    const currOrg = req.user.organizationId;
    if (!currOrg) {
      return res.status(403).json({ message: "No Organization Found" });
    }

    const currOrganization = await organizer.findById(currOrg);

    if (currOrganization) return res.status(200).json(currOrganization);
    else return res.status(403).json({ message: "No Organization Found" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createorganization = async (req, res) => {
  try {
    //TODO: emit organization created from here

    if (req.user.organizationId) {
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
      await kafkaProducer.publish("organization.created", {
        organizationId: newOrganization._id.toString(),
        organizationName: newOrganization.organizationName,
        organizationMail: newOrganization.organizationMail,
        phoneNo: newOrganization.phoneNo,
        createdBy: req.user._id.toString(),
      });

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
    console.log("event data in server : ", eventData);

    // Get user's organization
    console.log(req.user);
    if (!req.user.organizationId) {
      return res.status(403).json({ message: "No Organization Found" });
    }

    let pageId = eventData.page; // Default to existing page ID

    if (eventData.newPageName != null) {
      // new page case - create a new page
      let slug = eventData.newPageName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Check if slug already exists and make it unique
      const existingPage = await page.findOne({ slug });
      if (existingPage) {
        // Add timestamp to make slug unique
        slug = `${slug}-${Date.now()}`;
      }

      const newPage = await page.create({
        title: eventData.newPageName,
        slug: slug,
        authorId: req.user.organizationId,
        blocks: [],
        published: false,
      });

      pageId = newPage._id; // Use new page ID

      // Add new page to organization's drafts
      await organizer.findByIdAndUpdate(req.user.organizationId, {
        $push: { drafts: newPage._id },
      });
    }

    // Create event with all data fields
    const currevent = await event.create({
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
      coverImage: eventData.coverImage,
      page: pageId, // Reference to page (new or existing)
    });

    if (!currevent)
      return res
        .status(400)
        .json({ message: "Error creating event", error: error.message });

    // Add event to organization's events array
    await organizer.findByIdAndUpdate(req.user.organizationId, {
      $push: { events: currevent._id },
    });

    // Fetch the page to get its details for Kafka
    const eventPage = await page.findById(pageId);

    kafkaProducer.publish("event.created", {
      eventId: currevent._id.toString(),
      organizationId: req.user.organizationId,
      title: currevent.title,
      shortDescription: currevent.shortDescription,
      startDate: currevent.startDate,
      endDate: currevent.endDate,
      startTime: currevent.startTime,
      endTime: currevent.endTime,
      city: currevent.city,
      state: currevent.state,
      country: currevent.country,
      locationCoordinates: {
        latitude: currevent.locationCoordinates.latitude,
        longitude: currevent.locationCoordinates.longitude,
      },
      eventCategory: currevent.eventCategory,
      page: {
        pageId: eventPage._id.toString(),
        slug: eventPage.slug,
      },
      published: false,
      coverImage: currevent.coverImage,
    });

    return res.status(201).json({
      message: "Event created successfully",
      event: currevent,
      pageId,
    });
  } catch (error) {
    console.log("Error creating event:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

exports.putPublishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.organizationId;

    const owner = await organizer.findById(ownerId);

    if (!owner.events.includes(id))
      return res.status(403).json({ message: "Not Authorized" });

    const currevent = await event.findById(id).populate("page");
    currevent.published = true;
    await currevent.save();

    const eventPage = await page.findById(currevent.page);

    // Publish to Kafka for Discovery Service
    await kafkaProducer.publish("event.published", {
      eventId: currevent._id.toString(),
      organizationId: ownerId.toString(),
      title: currevent.title,
      shortDescription: currevent.shortDescription,
      startDate: currevent.startDate,
      endDate: currevent.endDate,
      startTime: currevent.startTime,
      endTime: currevent.endTime,
      city: currevent.city,
      state: currevent.state,
      country: currevent.country,
      locationCoordinates: {
        latitude: currevent.locationCoordinates.latitude,
        longitude: currevent.locationCoordinates.longitude,
      },
      eventCategory: currevent.eventCategory,
      page: {
        pageId: eventPage._id.toString(),
        slug: eventPage.slug,
      },
      published: true,
      coverImage: currevent.coverImage,
    });

    return res
      .status(200)
      .json({ message: "Published Event", eventData: currevent });
  } catch (error) {
    console.log("Error Publishing event:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(403).json({ message: "No Organization Found" });
    }

    // Find organization and populate its events
    const organization = await organizer
      .findById(organizationId)
      .populate("events")
      .lean();

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    return res.status(200).json(organization.events || []);
  } catch (error) {
    console.log("Error fetching events:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

exports.getAllDrafts = async (req, res) => {
  try {
    const { organizationId } = req.params;
    if (!organizationId) {
      return res.status(403).json({ message: "No Organization Found" });
    }
    if (req.user.organizationId.toString() !== organizationId) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    const allPages = await page.find({ authorId: organizationId });

    if (!allPages) {
      return res.status(200).json({
        success: false,
        message: "No Drafts Found",
      });
    }

    return res.status(200).json({
      success: false,
      message: "No Drafts Found",
      drafts: allPages,
    });
  } catch (error) {
    console.log("Error fetching drafts:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
