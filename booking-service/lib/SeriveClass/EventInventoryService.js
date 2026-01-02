const EventInventory = require("../../models/eventInventory");
const mongoose = require("mongoose");

class EventInventoryService {
  //get inventory by event id
  async getInventoryByEventId(eventId) {
    try {
      const inventory = await EventInventory.findOne({ eventId });
      return inventory;
    } catch (err) {
      throw new Error("Error fetching inventory by event ID");
    }
  }

  //get all inventory using organizationId
  async getAllInventoryOfOrganization(organizationId) {
    try {
      const inventories = await EventInventory.find({ organizationId });
      return inventories;
    } catch (err) {
      throw new Error("Error fetching inventories of the organization");
    }
  }

  //create inventory
  async createInventory(eventData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Check if inventory already exists (idempotency)
      const existingInventory = await EventInventory.findOne({
        eventId: eventData.eventId,
      }).session(session);

      if (existingInventory) {
        await session.abortTransaction();
        console.log(`Inventory already exists for event ${eventData.eventId}`);
        return existingInventory;
      }

      // 2. Transform ticketConfiguration to ticketTypes format
      const ticketTypes = eventData.ticketConfiguration.map((ticket) => ({
        type: ticket.type,
        price: ticket.price,
        totalCapacity: ticket.totalCapacity,
        availableTickets: ticket.totalCapacity, // All tickets initially available
        reservedTickets: 0,
        soldTickets: 0,
        description: ticket.description || "",
      }));

      // 3. Calculate totals
      const totalCapacity = ticketTypes.reduce(
        (sum, ticket) => sum + ticket.totalCapacity,
        0
      );

      // 4. Create inventory document
      const inventory = new EventInventory({
        eventId: eventData.eventId,
        organizationId: eventData.organizationId,
        ticketTypes: ticketTypes,
        totalCapacity: totalCapacity,
        totalAvailable: totalCapacity,
        totalReserved: 0,
        totalSold: 0,
        isSoldOut: false,
        bookingSettings: {
          maxTicketsPerBooking:
            eventData.bookingSettings?.maxTicketsPerBooking || 10,
          bookingOpenDate:
            eventData.bookingSettings?.bookingOpenDate || new Date(),
          bookingCloseDate: eventData.bookingSettings?.bookingCloseDate,
        },
      });

      await inventory.save({ session });
      await session.commitTransaction();

      console.log(
        `✅ Inventory created for event ${eventData.eventId} with ${totalCapacity} total tickets`
      );
      return inventory;
    } catch (err) {
      await session.abortTransaction();
      console.error(
        `Error creating inventory for event ${eventData.eventId}:`,
        err.message
      );
      throw new Error("Error creating inventory");
    } finally {
      session.endSession();
    }
  }

  // reserve tickets (Available → Reserved)
  async updateInventoryOnReservation(eventId, ticketType, quantity, session) {
    const result = await EventInventory.findOneAndUpdate(
      {
        eventId: eventId,
        "ticketTypes.type": ticketType,
        "ticketTypes.availableTickets": { $gte: quantity }, // Only if enough available
      },
      {
        $inc: {
          "ticketTypes.$.availableTickets": -quantity,
          "ticketTypes.$.reservedTickets": quantity,
          totalAvailable: -quantity,
          totalReserved: quantity,
        },
      },
      { new: true, session }
    );

    if (!result) {
      throw new Error(
        `Insufficient tickets available for ${ticketType}. Requested: ${quantity}`
      );
    }

    // Check if sold out
    if (result.totalAvailable === 0) {
      result.isSoldOut = true;
      await result.save({ session });
    }

    return result;
  }

  //cancel reservation
  async updateInventoryOnReservationCancel(
    eventId,
    ticketType,
    quantity,
    session
  ) {
    const result = await EventInventory.findOneAndUpdate(
      {
        eventId,
        "ticketTypes.type": ticketType,
        "ticketTypes.reservedTickets": { $gte: quantity }, // Only if enough available
      },
      {
        $inc: {
          "ticketTypes.$.availableTickets": quantity,
          "ticketTypes.$.reservedTickets": -quantity,
          totalAvailable: quantity,
          totalReserved: -quantity,
        },
      },
      {
        new: true,
        session,
      }
    );
    if (!result) {
      throw new Error(`Unable to process`);
    }

    // Check if sold out
    if (result.totalAvailable > 0) {
      result.isSoldOut = false;
      await result.save({ session });
    }

    return result;
  }

  // Confirm booking after payment (Reserved → Sold)
  async updateInventoryOnBooking(eventId, ticketType, quantity, session) {
    const result = await EventInventory.findOneAndUpdate(
      {
        eventId,
        "ticketTypes.type": ticketType,
        "ticketTypes.reservedTickets": { $gte: quantity }, // Must have reserved tickets
      },
      {
        $inc: {
          "ticketTypes.$.reservedTickets": -quantity, // Move from reserved
          "ticketTypes.$.soldTickets": quantity, // To sold
          totalReserved: -quantity,
          totalSold: quantity,
        },
      },
      {
        new: true,
        session,
      }
    );
    if (!result) {
      throw new Error(`Insufficient reserved tickets for ${ticketType}`);
    }

    return result;
  }

  // Cancel booking and refund (Sold → Available)
  async updateInventoryOnBookingCancel(eventId, ticketType, quantity, session) {
    const result = await EventInventory.findOneAndUpdate(
      {
        eventId,
        "ticketTypes.type": ticketType,
        "ticketTypes.soldTickets": { $gte: quantity }, // Must have sold tickets
      },
      {
        $inc: {
          "ticketTypes.$.soldTickets": -quantity, // Remove from sold
          "ticketTypes.$.availableTickets": quantity, // Return to available
          totalSold: -quantity,
          totalAvailable: quantity,
        },
        $set: { isSoldOut: false },
      },
      {
        new: true,
        session,
      }
    );
    if (!result) {
      throw new Error(`Insufficient sold tickets for ${ticketType}`);
    }

    return result;
  }

  // Update inventory configuration (ticket types and booking settings)
  async updateInventory(eventId, ticketConfiguration, bookingSettings) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get existing inventory
      const existingInventory = await EventInventory.findOne({
        eventId,
      }).session(session);

      if (!existingInventory) {
        await session.abortTransaction();
        throw new Error("Inventory not found");
      }

      // Check if any tickets have been sold or reserved
      const hasActiveBookings =
        existingInventory.totalSold > 0 || existingInventory.totalReserved > 0;

      // Transform new ticket configuration
      const newTicketTypes = ticketConfiguration.map((ticket) => {
        // Find existing ticket type to preserve sold/reserved counts
        const existingTicket = existingInventory.ticketTypes.find(
          (t) => t.type === ticket.type
        );

        if (existingTicket) {
          // Existing ticket type - preserve transaction data
          const newCapacity = ticket.totalCapacity;
          const usedCapacity =
            existingTicket.soldTickets + existingTicket.reservedTickets;

          // Validate new capacity is not less than already used
          if (newCapacity < usedCapacity) {
            throw new Error(
              `Cannot reduce capacity of "${ticket.type}" below ${usedCapacity} (already sold/reserved)`
            );
          }

          return {
            type: ticket.type,
            price: ticket.price,
            totalCapacity: newCapacity,
            availableTickets: newCapacity - usedCapacity,
            reservedTickets: existingTicket.reservedTickets,
            soldTickets: existingTicket.soldTickets,
            description: ticket.description || "",
          };
        } else {
          // New ticket type
          return {
            type: ticket.type,
            price: ticket.price,
            totalCapacity: ticket.totalCapacity,
            availableTickets: ticket.totalCapacity,
            reservedTickets: 0,
            soldTickets: 0,
            description: ticket.description || "",
          };
        }
      });

      // Calculate new totals
      const totalCapacity = newTicketTypes.reduce(
        (sum, ticket) => sum + ticket.totalCapacity,
        0
      );
      const totalAvailable = newTicketTypes.reduce(
        (sum, ticket) => sum + ticket.availableTickets,
        0
      );
      const totalReserved = newTicketTypes.reduce(
        (sum, ticket) => sum + ticket.reservedTickets,
        0
      );
      const totalSold = newTicketTypes.reduce(
        (sum, ticket) => sum + ticket.soldTickets,
        0
      );

      // Update inventory
      existingInventory.ticketTypes = newTicketTypes;
      existingInventory.totalCapacity = totalCapacity;
      existingInventory.totalAvailable = totalAvailable;
      existingInventory.totalReserved = totalReserved;
      existingInventory.totalSold = totalSold;
      existingInventory.isSoldOut = totalAvailable === 0;

      // Update booking settings if provided
      if (bookingSettings) {
        existingInventory.bookingSettings = {
          maxTicketsPerBooking:
            bookingSettings.maxTicketsPerBooking ||
            existingInventory.bookingSettings.maxTicketsPerBooking,
          bookingOpenDate:
            bookingSettings.bookingOpenDate ||
            existingInventory.bookingSettings.bookingOpenDate,
          bookingCloseDate:
            bookingSettings.bookingCloseDate ||
            existingInventory.bookingSettings.bookingCloseDate,
        };
      }

      await existingInventory.save({ session });
      await session.commitTransaction();

      console.log(`✅ Inventory updated for event ${eventId}`);
      return existingInventory;
    } catch (err) {
      await session.abortTransaction();
      console.error(
        `Error updating inventory for event ${eventId}:`,
        err.message
      );
      throw err;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new EventInventoryService();
