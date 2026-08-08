const Redis = require("ioredis");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const CHANNEL = "sse-events";

class SSE {
  constructor() {
    // Map<organizationId, {response, eventsId}>
    this.clients = new Map();

    // Separate connections: one locked into subscriber mode, one for publishing
    this.subscriber = new Redis(REDIS_URL);
    this.publisher = new Redis(REDIS_URL);

    this.subscriber.subscribe(CHANNEL, (err) => {
      if (err) {
        console.error("❌ Redis subscribe failed:", err);
      } else {
        console.log(`✅ Subscribed to Redis channel: ${CHANNEL}`);
      }
    });

    this.subscriber.on("message", (channel, message) => {
      if (channel !== CHANNEL) return;

      try {
        const { organizationId, eventType, data } = JSON.parse(message);
        this._sendLocal(organizationId, eventType, data);
      } catch (error) {
        console.error("Error parsing Redis SSE message:", error);
      }
    });
  }

  addClient(organizationId, response, eventsId = []) {
    this.clients.set(organizationId, {
      response,
      eventsId: new Set(eventsId),
    });

    console.log(`✅ SSE Client connected: Org ${organizationId}`);
  }

  removeClient(organizationId) {
    this.clients.delete(organizationId);
    console.log(`❌ SSE Client disconnected: Org ${organizationId}`);
  }

  // Publishes to Redis instead of writing directly — reaches whichever
  // instance actually holds this org's connection
  sendToOrganization(organizationId, eventType, data) {
    this.publisher.publish(
      CHANNEL,
      JSON.stringify({ organizationId, eventType, data })
    );
  }

  // Actual local write — only runs on the instance that receives the
  // Redis message AND has this org's connection open
  _sendLocal(organizationId, eventType, data) {
    try {
      const client = this.clients.get(organizationId);
      if (!client) {
        // Normal — this org isn't connected to this particular instance
        return;
      }

      if (client.eventsId.size === 0 || client.eventsId.has(data.eventId)) {
        client.response.write(`event: ${eventType}\n`);
        client.response.write(`data: ${JSON.stringify(data)}\n\n`);
        console.log(
          `📤 SSE sent to org ${organizationId} for event ${data.eventId}:`,
          eventType
        );
      }
    } catch (error) {
      console.error(`Error sending to organization ${organizationId}:`, error);
      this.removeClient(organizationId);
    }
  }

  updateEventSubscriptions(organizationId, eventsId) {
    const client = this.clients.get(organizationId);
    if (client) {
      client.eventsId = new Set(eventsId);
    }
  }
}

module.exports = new SSE();