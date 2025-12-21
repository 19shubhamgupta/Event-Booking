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
        topics: ["payment.complete"],
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
        error
      );
      throw error; // Re-throw to trigger Kafka retry mechanism
    }
  }

  async disconnect() {
    if (!this.isConnected) return;

    await this.consumer.disconnect();
    this.isConnected = false;
    console.log("Kafka Consumer disconnected");
  }
}

module.exports = new kafkaConsumer();
