const Inventory = require("../models/inventory");

exports.createInventorywhenEventIsCreated = async (eventData) => {
  try {
    console.log("📦 Creating inventory for event:", eventData.eventId);

    // Check if inventory already exists
    const existingInventory = await Inventory.findOne({
      eventId: eventData.eventId,
    });

    if (existingInventory) {
      console.log("⚠️ Inventory already exists for event:", eventData.eventId);
      return existingInventory;
    }

    // Create initial inventory with event data
    // Ticket types will be populated when inventory.created event is received
    const inventory = await Inventory.create({
      eventId: eventData.eventId,
      organizationId: eventData.organizationId,

      // Event details
      eventTitle: eventData.title,
      eventCategory: eventData.eventCategory,
      eventStatus: "draft", // Initial status
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: {
        city: eventData.city,
        state: eventData.state,
        country: eventData.country,
      },

      // Initialize with empty ticket types (will be populated later)
      ticketTypes: [],

      // Initialize inventory stats with zeros
      totalCapacity: 0,
      totalAvailable: 0,
      totalReserved: 0,
      totalSold: 0,
      isSoldOut: false,

      // Default booking settings
      bookingSettings: {
        maxTicketsPerBooking: 10,
        isBookingOpen: false,
      },

      // Initialize booking stats
      bookingStats: {
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        refundedAmount: 0,
        netRevenue: 0,
      },

      // Reservation tracking
      activeReservations: 0,

      // Sync timestamp
      lastSyncedAt: new Date(),
    });

    console.log("✅ Inventory created successfully:", inventory._id);

    return inventory;
  } catch (error) {
    console.error("❌ Error creating inventory for event:", error);
    throw error;
  }
};

exports.updateInventoryWithTicketConfiguration = async (inventoryData) => {
  try {
    console.log(
      "🎫 Updating inventory with ticket configuration:",
      inventoryData.eventId
    );

    // Find existing inventory
    const inventory = await Inventory.findOne({
      eventId: inventoryData.eventId,
    });

    if (!inventory) {
      console.log("⚠️ Inventory not found for event:", inventoryData.eventId);
      // If inventory doesn't exist, create it with full data
      return await Inventory.create({
        eventId: inventoryData.eventId,
        organizationId: inventoryData.organizationId,
        eventTitle: inventoryData.eventId, // Will be updated when event details are synced
        ticketTypes: inventoryData.ticketTypes || [],
        totalCapacity: inventoryData.totalCapacity || 0,
        totalAvailable: inventoryData.totalAvailable || 0,
        totalReserved: inventoryData.totalReserved || 0,
        totalSold: inventoryData.totalSold || 0,
        isSoldOut: inventoryData.isSoldOut || false,
        bookingSettings: inventoryData.bookingSettings || {},
        lastSyncedAt: new Date(),
      });
    }

    // Update inventory with ticket configuration
    inventory.ticketTypes = inventoryData.ticketTypes || inventory.ticketTypes;
    inventory.totalCapacity =
      inventoryData.totalCapacity || inventory.totalCapacity;
    inventory.totalAvailable =
      inventoryData.totalAvailable || inventory.totalAvailable;
    inventory.totalReserved =
      inventoryData.totalReserved || inventory.totalReserved;
    inventory.totalSold = inventoryData.totalSold || inventory.totalSold;
    inventory.isSoldOut = inventoryData.isSoldOut || inventory.isSoldOut;

    if (inventoryData.bookingSettings) {
      inventory.bookingSettings = {
        ...inventory.bookingSettings,
        ...inventoryData.bookingSettings,
      };
    }

    inventory.lastSyncedAt = new Date();

    await inventory.save();

    console.log(
      "✅ Inventory updated with ticket configuration:",
      inventory._id
    );
    return inventory;
  } catch (error) {
    console.error(
      "❌ Error updating inventory with ticket configuration:",
      error
    );
    throw error;
  }
};

exports.getInventoriesByQuery = async (req, res) => {
  try {
    const status = req.query.status;
    const orgId = req.user.organizationId;
    if (!status || !orgId) {
      return res.status(400).json({
        message: "Invalid Request",
      });
    }

    const inventories = await Inventory.find({
      organizationId: orgId,
      eventStatus: status,
    });
    return res
      .status(200)
      .json({ inventories, message: "Inventories fetched successfully" });
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getInventoryById = async (req, res) => {
  try {
    const inventoryId = req.params.inventoryId;
    if (!inventoryId) {
      return res.status(400).json({
        message: "Invalid Request",
      });
    }
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        message: "Inventory not found",
      });
    }
    return res
      .status(200)
      .json({ inventory, message: "Inventory fetched successfully" });
  } catch (error) {
    console.error("Error fetching inventory by ID:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};