const EventInventoryService = require("../lib/SeriveClass/EventInventoryService");

exports.postCreateInventory = async (req, res) => {
  try {
    const { organizationId, eventId, ticketConfiguration, bookingSettings } =
      req.body;

    // Validate required fields
    if (!organizationId || !organizationId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    if (!eventId || !eventId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    // Validate ticketConfiguration
    if (!ticketConfiguration || !Array.isArray(ticketConfiguration)) {
      return res.status(400).json({
        success: false,
        message: "Ticket configuration must be an array",
      });
    }

    if (ticketConfiguration.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one ticket type is required",
      });
    }

    // Validate each ticket type
    for (let i = 0; i < ticketConfiguration.length; i++) {
      const ticket = ticketConfiguration[i];

      if (!ticket.type || !ticket.type.trim()) {
        return res.status(400).json({
          success: false,
          message: `Ticket type ${i + 1}: Ticket name is required`,
        });
      }

      if (ticket.price === undefined || ticket.price === null) {
        return res.status(400).json({
          success: false,
          message: `Ticket type ${i + 1}: Price is required`,
        });
      }

      if (isNaN(ticket.price) || ticket.price < 0) {
        return res.status(400).json({
          success: false,
          message: `Ticket type ${i + 1}: Price must be a positive number`,
        });
      }

      if (!ticket.totalCapacity) {
        return res.status(400).json({
          success: false,
          message: `Ticket type ${i + 1}: Total capacity is required`,
        });
      }

      if (
        isNaN(ticket.totalCapacity) ||
        ticket.totalCapacity < 1 ||
        !Number.isInteger(Number(ticket.totalCapacity))
      ) {
        return res.status(400).json({
          success: false,
          message: `Ticket type ${
            i + 1
          }: Total capacity must be a positive integer`,
        });
      }
    }

    // Validate bookingSettings if provided
    if (bookingSettings) {
      if (bookingSettings.maxTicketsPerBooking !== undefined) {
        const maxTickets = bookingSettings.maxTicketsPerBooking;
        if (
          isNaN(maxTickets) ||
          maxTickets < 1 ||
          maxTickets > 20 ||
          !Number.isInteger(Number(maxTickets))
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Max tickets per booking must be an integer between 1 and 20",
          });
        }
      }

      if (bookingSettings.bookingOpenDate) {
        const openDate = new Date(bookingSettings.bookingOpenDate);
        if (isNaN(openDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid booking open date",
          });
        }
      }

      if (bookingSettings.bookingCloseDate) {
        const closeDate = new Date(bookingSettings.bookingCloseDate);
        if (isNaN(closeDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid booking close date",
          });
        }

        // Check if close date is after open date
        if (bookingSettings.bookingOpenDate) {
          const openDate = new Date(bookingSettings.bookingOpenDate);
          if (closeDate <= openDate) {
            return res.status(400).json({
              success: false,
              message: "Booking close date must be after open date",
            });
          }
        }
      }
    }

    // Check for duplicate ticket types
    const ticketTypes = ticketConfiguration.map((t) =>
      t.type.trim().toLowerCase()
    );
    const duplicates = ticketTypes.filter(
      (type, index) => ticketTypes.indexOf(type) !== index
    );
    if (duplicates.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Duplicate ticket type found: ${duplicates[0]}`,
      });
    }

    // Create inventory
    const inventory = await EventInventoryService.createInventory({
      organizationId,
      eventId,
      ticketConfiguration,
      bookingSettings,
    });

    return res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      data: {
        inventoryId: inventory._id,
        eventId: inventory.eventId,
        totalCapacity: inventory.totalCapacity,
        ticketTypesCount: inventory.ticketTypes.length,
      },
    });
  } catch (error) {
    console.error("Error creating inventory:", error);

    // Handle specific errors
    if (error.message && error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: "Inventory already exists for this event",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create inventory",
    });
  }
};

exports.getInventoryByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId || !eventId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    const inventory = await EventInventoryService.getInventoryByEventId(
      eventId
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found for this event",
      });
    }

    // Format ticket types with availability info
    const ticketTypesInfo = inventory.ticketTypes.map((ticket) => ({
      type: ticket.type,
      price: ticket.price,
      totalCapacity: ticket.totalCapacity,
      available: ticket.availableTickets,
      reserved: ticket.reservedTickets,
      sold: ticket.soldTickets,
    }));

    return res.status(200).json({
      success: true,
      data: {
        inventoryId: inventory._id,
        eventId: inventory.eventId,
        organizationId: inventory.organizationId,
        totalCapacity: inventory.totalCapacity,
        totalAvailable: inventory.totalAvailable,
        ticketTypes: ticketTypesInfo,
        bookingSettings: inventory.bookingSettings,
        createdAt: inventory.createdAt,
        updatedAt: inventory.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch inventory",
    });
  }
};
