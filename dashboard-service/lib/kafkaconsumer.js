const { Kafka } = require("kafkajs");
const {
  createInventorywhenEventIsCreated,
  updateInventoryWithTicketConfiguration,
  updateEventDetailsInInventory,
  updateInventoryConfiguration,
} = require("../controllers/inventoryControllers");
const inventory = require("../models/inventory");
const mongoose = require("mongoose");
const SSE = require("./SSE");

class kafkaConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: "event-booking-dasshboard-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });

    this.consumer = this.kafka.consumer({
      groupId: "dashboard-service-group",
      sessionTimeout: 60000, // 60 seconds (increased from 30s)
      heartbeatInterval: 3000, // 3 seconds
      rebalanceTimeout: 60000, // 60 seconds
      retry: {
        retries: 5,
        initialRetryTime: 300,
        maxRetryTime: 30000,
      },
    });

    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;
    try {
      await this.consumer.connect();
      this.isConnected = true;
      console.log("✅ Kafka Consumer connected");

      // subscribe to topics
      await this.consumer.subscribe({
        topics: [
          "event.created",
          "event.updated",
          "inventory.created",
          "inventory.updated",
          "reservation.success",
          "reservation.cancelled",
          "bookTicket.sucesss",
        ],
        fromBeginning: true,
      });

      await this.consumer.run({
        partitionsConsumedConcurrently: 3, // Process up to 3 partitions in parallel
        eachMessage: async ({ topic, partition, message, heartbeat }) => {
          try {
            const event = JSON.parse(message.value.toString());
            console.log(`📥 Received event from topic: ${topic}`, event);

            await this.handleEvent(topic, event);

            // Send heartbeat to avoid session timeout on long-running tasks
            await heartbeat();
          } catch (error) {
            console.error("Error processing message:", error);
            // Don't throw - log and continue to next message
          }
        },
      });
    } catch (error) {
      console.error("❌ Kafka Consumer connection failed:", error);
      throw error;
    }
  }

  async handleEvent(topic, event) {
    switch (topic) {
      case "event.created":
        await this.handleEventCreated(event.data);
        break;
      case "event.updated":
        await this.handleEventUpdated(event.data);
        break;
      case "inventory.created":
        await this.handleInventoryCreated(event.data);
        break;
      case "inventory.updated":
        await this.handleInventoryUpdated(event.data);
        break;
      case "reservation.success":
        await this.handleReservationSuccess(event.data);
        break;
      case "reservation.cancelled":
        await this.handleReservationCancel(event.data);
        break;
      case "bookTicket.sucesss":
        await this.handleBookingSuccess(event.data);
        break;
      default:
        console.log(`Unhandled topic: ${topic}`);
    }
  }

  //handling events
  async handleEventCreated(data) {
    try {
      console.log("Processing event.created:", data);
      await createInventorywhenEventIsCreated(data);
      console.log("✅ Inventory created for event:", data.eventId);
    } catch (error) {
      console.error("❌ Error handling event.created:", error);
      // Don't throw to allow Kafka to continue processing other messages
    }
  }
  async handleEventUpdated(data) {
    try {
      console.log("Processing event.updated:", data);
      await updateEventDetailsInInventory(data);
      console.log("✅ Event details updated in inventory:", data.eventId);
    } catch (error) {
      console.error("❌ Error handling event.updated:", error);
    }
  }
  async handleInventoryCreated(data) {
    try {
      console.log("Processing inventory.created:", data);
      await updateInventoryWithTicketConfiguration(data);
      console.log(
        "✅ Inventory updated with ticket configuration:",
        data.eventId
      );
    } catch (error) {
      console.error("❌ Error handling inventory.created:", error);
    }
  }
  async handleInventoryUpdated(data) {
    try {
      console.log("Processing inventory.updated:", data);
      await updateInventoryConfiguration(data);
      console.log("✅ Inventory configuration updated:", data.eventId);
    } catch (error) {
      console.error("❌ Error handling inventory.updated:", error);
    }
  }
  async handleReservationSuccess(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Data comes as { reservation: {...} } from Kafka
      const reservation = data.reservation || data;

      // Validate reservation
      if (!reservation || !reservation.eventId) {
        throw new Error("Invalid reservation data");
      }

      const inventoryDoc = await inventory.findOne(
        { eventId: reservation.eventId },
        null,
        { session }
      );

      if (!inventoryDoc) {
        throw new Error("Inventory not found");
      }

      let totalQty = 0;

      // Update per-ticket reserved counts
      for (const t of reservation.tickets) {
        const ticket = inventoryDoc.ticketTypes.find(
          (tt) => tt.type === t.ticketType
        );

        if (!ticket) {
          throw new Error(`Ticket type not found: ${t.ticketType}`);
        }

        totalQty += t.quantity;

        await inventory.updateOne(
          {
            eventId: reservation.eventId,
            "ticketTypes.type": t.ticketType,
          },
          {
            $inc: {
              "ticketTypes.$.availableTickets": -t.quantity,
              "ticketTypes.$.reservedTickets": t.quantity,
            },
          },
          { session }
        );
      }

      // Update aggregate inventory counters
      const invt = await inventory.updateOne(
        { eventId: reservation.eventId },
        {
          $inc: {
            totalAvailable: -totalQty,
            totalReserved: totalQty,
            activeReservations: 1,
          },
          $set: {
            lastSyncedAt: new Date(),
          },
        },
        { session }
      );

      await session.commitTransaction();

      console.log(
        `✅ Reservation ${reservation._id} synced to dashboard inventory`
      );

      SSE.sendToOrganization(
        inventoryDoc.organizationId,
        "reservation.success",
        {
          eventId: reservation.eventId,
          reservationId: reservation._id,
          ticketsReserved: totalQty,
          tickets: reservation.tickets,
          userId: reservation.userId,
          timestamp: new Date(),
        }
      );

      console.log("status send to client abt res success");
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Error handling reservation.success:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }
  async handleBookingSuccess(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Data comes as { booking: {...} } from Kafka
      const booking = data.booking || data;

      if (!booking || !booking.eventId) {
        throw new Error("Invalid booking data");
      }

      const inventoryDoc = await inventory.findOne(
        { eventId: booking.eventId },
        null,
        { session }
      );

      if (!inventoryDoc) {
        throw new Error("Inventory not found");
      }

      let totalQty = 0;
      let totalAmount = 0;

      // Move tickets from reserved to sold
      for (const t of booking.tickets) {
        const ticket = inventoryDoc.ticketTypes.find(
          (tt) => tt.type === t.ticketType
        );

        if (!ticket) {
          throw new Error(`Ticket type not found: ${t.ticketType}`);
        }

        if (ticket.reservedTickets < t.quantity) {
          throw new Error(`Not enough reserved tickets for ${t.ticketType}`);
        }

        totalQty += t.quantity;
        totalAmount += t.quantity * t.price;

        await inventory.updateOne(
          {
            eventId: booking.eventId,
            "ticketTypes.type": t.ticketType,
          },
          {
            $inc: {
              "ticketTypes.$.reservedTickets": -t.quantity,
              "ticketTypes.$.soldTickets": t.quantity,
            },
          },
          { session }
        );
      }

      // Update aggregate inventory and booking stats
      await inventory.updateOne(
        { eventId: booking.eventId },
        {
          $inc: {
            totalReserved: -totalQty,
            totalSold: totalQty,
            activeReservations: -1,
            "bookingStats.totalBookings": 1,
            "bookingStats.confirmedBookings": 1,
            "bookingStats.totalRevenue": totalAmount,
            "bookingStats.netRevenue": totalAmount,
          },
          $set: {
            lastSyncedAt: new Date(),
          },
        },
        { session }
      );

      await session.commitTransaction();
      console.log(`✅ Booking ${booking._id} synced to dashboard inventory`);

      SSE.sendToOrganization(inventoryDoc.organizationId, "booking.success", {
        eventId: booking.eventId,
        reservationId: booking.reservationId,
        tickets: booking.tickets,
        ticketsBooked: totalQty,
      });
    } catch (err) {
      await session.abortTransaction();
      console.error("❌ Error handling bookTicket.success:", err);
      throw err;
    } finally {
      session.endSession();
    }
  }
  async handleReservationCancel(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Data comes as { reservation: {...} } from Kafka
      const reservation = data.reservation || data;

      if (!reservation || !reservation.eventId) {
        throw new Error("Invalid reservation data");
      }

      const inventoryDoc = await inventory.findOne(
        { eventId: reservation.eventId },
        null,
        { session }
      );

      if (!inventoryDoc) {
        throw new Error("Inventory not found for event");
      }

      let totalQty = 0;

      // Release reserved tickets back to available
      for (const t of reservation.tickets) {
        const ticket = inventoryDoc.ticketTypes.find(
          (tt) => tt.type === t.ticketType
        );

        if (!ticket) {
          throw new Error(`Ticket type not found: ${t.ticketType}`);
        }

        if (ticket.reservedTickets < t.quantity) {
          throw new Error(
            `Reserved tickets less than cancellation quantity for ${t.ticketType}`
          );
        }

        totalQty += t.quantity;

        await inventory.updateOne(
          {
            eventId: reservation.eventId,
            "ticketTypes.type": t.ticketType,
          },
          {
            $inc: {
              "ticketTypes.$.availableTickets": t.quantity,
              "ticketTypes.$.reservedTickets": -t.quantity,
            },
          },
          { session }
        );
      }

      // Update aggregate counters
      await inventory.updateOne(
        { eventId: reservation.eventId },
        {
          $inc: {
            totalAvailable: totalQty,
            totalReserved: -totalQty,
            activeReservations: -1,
          },
          $set: {
            lastSyncedAt: new Date(),
          },
        },
        { session }
      );

      await session.commitTransaction();
      console.log(
        `✅ Reservation ${reservation._id} cancellation synced to dashboard inventory`
      );

      SSE.sendToOrganization(
        inventoryDoc.organizationId,
        "reservation.cancelled",
        {
          eventId: reservation.eventId,
          reservationId: reservation._id,
          ticketsReservedCancelled: totalQty,
          tickets: reservation.tickets,
          userId: reservation.userId,
          timestamp: new Date(),
        }
      );

      console.log("reservation cancelled sent to client");
    } catch (err) {
      await session.abortTransaction();
      console.error("❌ Error handling reservation.cancelled:", err);
      throw err;
    } finally {
      session.endSession();
    }
  }

  //disconnect consumer
  async disconnect() {
    if (!this.isConnected) return;

    await this.consumer.disconnect();
    this.isConnected = false;
    console.log("Kafka Consumer disconnected");
  }
}

module.exports = new kafkaConsumer();
