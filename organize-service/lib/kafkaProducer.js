const { Kafka } = require("kafkajs");

class kafkaProducer {
  constructor() {
    this.kafka = new Kafka({
      clientId: "event-booking-organize-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
      retry: {
        retries: 5,
        initialRetryTime: 300,
      },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 60000, // Increased to 60 seconds
      idempotent: true, // Ensure exactly-once delivery
      maxInFlightRequests: 5,
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
      await this.producer.connect();
      this.isConnected = true;
      console.log("✅ Kafka Producer connected");
    } catch (error) {
      console.error("❌ Kafka Producer connection failed:", error);
      throw error;
    }
  }

  async publish(topic, event) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.aggregateId,
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

    await this.producer.disconnect();
    this.isConnected = false;
    console.log("Kafka Producer disconnected");
  }
}

module.exports = new kafkaProducer();
