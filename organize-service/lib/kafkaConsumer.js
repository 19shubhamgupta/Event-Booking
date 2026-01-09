const { Kafka } = require("kafkajs");
const Event = require("../models/event");
const show = require("../models/show");

class kafkaConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: "event-booking-organize-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });

    this.consumer = this.kafka.consumer({
      groupId: "event-organize-service-group",
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
        topics: ["event.booking.dates"],
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
      case "event.booking.dates":
        await this.handleBookingDates(data);
        break;
      default:
        console.log(`Unhandled topic: ${topic}`);
    }
  }

  //   async handleEventUpdated(data) {
  //     console.log("Processing event.updated:", data);

  //     try {
  //       // Build update object with only provided fields
  //       const updateFields = {};

  //       if (data.title !== undefined) updateFields.title = data.title;
  //       if (data.shortDescription !== undefined)
  //         updateFields.shortDescription = data.shortDescription;
  //       if (data.startDate !== undefined)
  //         updateFields.startDate = new Date(data.startDate);
  //       if (data.endDate !== undefined)
  //         updateFields.endDate = new Date(data.endDate);
  //       if (data.startTime !== undefined) updateFields.startTime = data.startTime;
  //       if (data.endTime !== undefined) updateFields.endTime = data.endTime;
  //       if (data.city !== undefined) updateFields.city = data.city;
  //       if (data.state !== undefined) updateFields.state = data.state;
  //       if (data.country !== undefined) updateFields.country = data.country;
  //       if (data.eventCategory !== undefined)
  //         updateFields.eventCategory = data.eventCategory;
  //       if (data.coverImage !== undefined)
  //         updateFields.coverImage = data.coverImage;

  //       // Handle location coordinates if provided
  //       if (
  //         data.locationCoordinates &&
  //         data.locationCoordinates.longitude !== undefined &&
  //         data.locationCoordinates.latitude !== undefined
  //       ) {
  //         updateFields.location = {
  //           type: "Point",
  //           coordinates: [
  //             data.locationCoordinates.longitude,
  //             data.locationCoordinates.latitude,
  //           ],
  //         };
  //       }

  //       // Handle page slug if provided
  //       if (data.page && data.page.slug !== undefined) {
  //         updateFields["page.slug"] = data.page.slug;
  //       }

  //       // Update existing event in discovery service
  //       const updatedEvent = await Event.findOneAndUpdate(
  //         { eventId: data.eventId },
  //         { $set: updateFields },
  //         { new: true }
  //       );

  //       if (updatedEvent) {
  //         console.log(`✅ Event ${data.eventId} updated in discovery service`);
  //       } else {
  //         console.log(`⚠️  Event ${data.eventId} not found in discovery service`);
  //       }
  //     } catch (error) {
  //       console.error(`❌ Error updating event in discovery service:`, error);
  //       throw error;
  //     }
  //   }

  async handleBookingDates(data) {
    console.log("Processing event.booking.dates:", data.eventId);

    try {
      const updateFields = {};

      if (data.bookingOpenDate !== undefined) {
        updateFields.bookingOpenDate = new Date(data.bookingOpenDate);
      }
      if (data.bookingCloseDate !== undefined) {
        updateFields.bookingCloseDate = new Date(data.bookingCloseDate);
      }

      const updatedEvent = await Event.findOneAndUpdate(
        { _id: data.eventId },
        { $set: updateFields },
        { new: true }
      );

      if (updatedEvent) {
        console.log(`✅ Booking dates updated for event ${data.eventId}`);
      } else {
        
        console.log(`⚠️ Event ${data.eventId} not found in organize service`);
        console.log(`⚠️  Event ${data.eventId} now searching for a show`);
        const UpdatedShow = await show.findByIdAndUpdate(
          { _id: data.eventId },
          { $set: updateFields },
          { new: true }
        );

        if(UpdatedShow){
          console.log(`✅ Booking dates updated for show ${data.eventId}`); 
        }else{
          console.log(`⚠️ Show ${data.eventId} not found in organize service`);
        }

      }
    } catch (error) {
      console.error(`❌ Error updating booking dates:`, error);
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
