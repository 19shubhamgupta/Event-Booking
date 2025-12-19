const { Kafka } = require("kafkajs");
const Event = require("../models/event");

class kafkaConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: "event-booking-discovery-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });

    this.consumer = this.kafka.consumer({
      groupId: "event-discovery-service-group",
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
        topics: ["event.published", "event.updated"],
        fromBeginning: true,
      });

      await this.consumer.run({
        partitionsConsumedConcurrently: 3, // Process up to 3 partitions in parallel
        eachMessage: async ({ topic, partition, message, heartbeat }) => {
          try {
            const eventData = JSON.parse(message.value.toString());
            console.log(`📥 Received event from topic: ${topic}`, eventData);

            await this.handleEvent(topic, eventData);

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

  async handleEvent(topic, eventData) {
    // Extract data from wrapped message structure
    const data = eventData.data || eventData;

    switch (topic) {
      case "event.published":
        await this.handleEventPublished(data);
        break;
      case "event.updated":
        await this.handleEventUpdated(data);
        break;
      default:
        console.log(`Unhandled topic: ${topic}`);
    }
  }

  async handleEventPublished(data) {
    console.log("Processing event.published:", data);

    try {
      // Check if event already exists (idempotency)
      const existingEvent = await Event.findOne({ eventId: data.eventId });

      if (existingEvent) {
        console.log(
          `⚠️  Event ${data.eventId} already exists in discovery service, skipping...`
        );
        return;
      }

      // Create event with GeoJSON location format
      const currEvent = await Event.create({
        eventId: data.eventId,
        organizationId: data.organizationId,
        title: data.title,
        shortDescription: data.shortDescription,

        // Convert date strings to Date objects
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        startTime: data.startTime,
        endTime: data.endTime,

        // Location fields
        city: data.city,
        state: data.state,
        country: data.country,

        // GeoJSON format for geospatial queries
        // IMPORTANT: MongoDB requires [longitude, latitude] order!
        location: {
          type: "Point",
          coordinates: [
            data.locationCoordinates.longitude,
            data.locationCoordinates.latitude,
          ],
        },

        eventCategory: data.eventCategory,

        // Denormalized page data
        page: {
          pageId: data.page.pageId,
          slug: data.page.slug,
        },

        coverImage: data.coverImage,
        published: data.published,
      });

      console.log(
        `✅ Event ${data.eventId} added to discovery service - "${data.title}" in ${data.city}`
      );
    } catch (error) {
      console.error(`❌ Error creating event in discovery service:`, error);
      throw error; // Kafka will retry
    }
  }

  async handleEventUpdated(data) {
    console.log("Processing event.updated:", data);

    try {
      // Update existing event in discovery service
      const updatedEvent = await Event.findOneAndUpdate(
        { eventId: data.eventId },
        {
          title: data.title,
          shortDescription: data.shortDescription,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          startTime: data.startTime,
          endTime: data.endTime,
          city: data.city,
          state: data.state,
          country: data.country,
          location: {
            type: "Point",
            coordinates: [
              data.locationCoordinates.longitude,
              data.locationCoordinates.latitude,
            ],
          },
          eventCategory: data.eventCategory,
          "page.slug": data.page.slug,
          coverImage: data.coverImage,
        },
        { new: true }
      );

      if (updatedEvent) {
        console.log(`✅ Event ${data.eventId} updated in discovery service`);
      } else {
        console.log(`⚠️  Event ${data.eventId} not found in discovery service`);
      }
    } catch (error) {
      console.error(`❌ Error updating event in discovery service:`, error);
      throw error;
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
