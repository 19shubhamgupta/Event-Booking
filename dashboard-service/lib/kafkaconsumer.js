const { Kafka } = require("kafkajs");
const {
  createInventorywhenEventIsCreated,
  updateInventoryWithTicketConfiguration,
} = require("../controllers/inventoryControllers");

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
    console.log("Processing event.updated:", data);
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
    console.log("Processing inventory.updated:", data);
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
