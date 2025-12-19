const { Kafka } = require("kafkajs");
const user = require("../models/user");
const { generateToken } = require("./generateToken");

class kafkaConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: "event-booking-user-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });

    this.consumer = this.kafka.consumer({
      groupId: "user-service-group",
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
        topics: ["organization.created", "organization.updated"],
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
      case "organization.created":
        await this.handleOrganizationCreated(event.data);
        break;
      case "organization.updated":
        await this.handleOrganizationUpdated(event.data);
        break;
      default:
        console.log(`Unhandled topic: ${topic}`);
    }
  }

  async handleOrganizationCreated(data) {
    console.log("Processing organization.created:", data);

    // Update user with organizationId (Kafka consumer ONLY updates DB)
    await user.findByIdAndUpdate(
      data.createdBy,
      {
        organizationDetails: {
          organizationId: data.organizationId,
          organizationName: data.organizationName,
          organizationMail: data.organizationMail,
          phoneNo: data.phoneNo,
        },
      },
      { new: true } // Return updated document
    );

    console.log(
      `✅ Updated user ${data.createdBy} with org ${data.organizationId}`
    );
    console.log(
      `ℹ️  User needs to refresh token via frontend or re-login to get updated organizationId in JWT`
    );
  }

  async handleOrganizationUpdated(data) {
    console.log("Processing organization.updated:", data);
    // Handle update logic
  }
  async disconnect() {
    if (!this.isConnected) return;

    await this.consumer.disconnect();
    this.isConnected = false;
    console.log("Kafka Consumer disconnected");
  }
}

module.exports = new kafkaConsumer();
