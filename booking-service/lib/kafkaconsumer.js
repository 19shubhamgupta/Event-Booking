const { Kafka } = require("kafkajs");

const { bookTickets } = require("../controllers/bookController");
const { cancelReservation } = require("../controllers/reservationController");

class kafkaConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: "event-booking-booking-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });

    this.consumer = this.kafka.consumer({
      groupId: "booking-service-group",
      sessionTimeout: 60000, // 60 seconds (increased from 30s)
      heartbeatInterval: 3000, // 3 seconds
      rebalanceTimeout: 60000, // 60 seconds
      retry: {
        retries: 5,
        initialRetryTime: 300,
        maxRetryTime: 30000,
      },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 60000,
      idempotent: true,
      maxInFlightRequests: 5,
      retry: {
        retries: 5,
        initialRetryTime: 300,
        maxRetryTime: 30000,
      },
    });

    this.isConnected = false;
    this.isProducerConnected = false;
  }

  async connect() {
    if (this.isConnected) return;
    try {
      await this.consumer.connect();
      await this.producer.connect();
      this.isConnected = true;
      this.isProducerConnected = true;
      console.log("✅ Kafka Consumer connected");
      console.log("✅ Kafka Producer connected");

      // subscribe to topics
      await this.consumer.subscribe({
        topics: ["payment.complete", "event.scheduled"],
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
      case "payment.complete":
        await this.handlePaymentComplete(event.data);
        break;
      case "event.scheduled":
        await this.handleEventScheduled(event.data);
        break;
      default:
        console.log(`Unhandled topic: ${topic}`);
    }
  }

  async handlePaymentComplete(data) {
    try {
      if (data.success === true) {
        await bookTickets(data);
        console.log("✅ Booking completed successfully");
      }
      if (data.success === false) {
        await cancelReservation(data);
        console.log("✅ Reservation cancelled successfully");
      }
    } catch (error) {
      console.error(
        "❌ Error processing payment complete in kafkaconsumer:",
        error,
      );
      throw error; // Re-throw to trigger Kafka retry mechanism
    }
  }

  async handleEventScheduled(data) {
    try {
      console.log("Processing event.scheduled:", data.eventId);

      // Get booking dates from inventory
      const EventInventoryService = require("../lib/SeriveClass/EventInventoryService");
      const kafkaProducer = require("./kafkaProducer");
      const inventory = await EventInventoryService.getInventoryByEventId(
        data.eventId,
      );

      if (inventory && inventory.bookingSettings) {
        // Publish booking dates to discovery service
        await kafkaProducer.publish("event.booking.dates", {
          eventId: data.eventId,
          bookingOpenDate: inventory.bookingSettings.bookingOpenDate,
          bookingCloseDate: inventory.bookingSettings.bookingCloseDate,
        });

        console.log("✅ Booking dates published for event:", data.eventId);
      } else {
        console.log(
          "⚠️ No inventory or booking settings found for event:",
          data.eventId,
        );
      }
    } catch (error) {
      console.error("❌ Error handling event.scheduled:", error);
    }
  }
  // Producer method to publish events
  async publish(topic, event) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.aggregateId || event.eventId || "default-key",
            value: JSON.stringify({
              type: topic,
              data: event,
            }),
          },
        ],
      });
      console.log(`📤 Event published: ${topic}`, event);
    } catch (error) {
      console.error(`❌ Failed to publish event: ${topic}`, error);
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) return;

    await this.consumer.disconnect();
    this.isConnected = false;
    console.log("Kafka Consumer disconnected");

    if (this.isProducerConnected) {
      await this.producer.disconnect();
      this.isProducerConnected = false;
      console.log("Kafka Producer disconnected");
    }
  }
}

module.exports = new kafkaConsumer();
