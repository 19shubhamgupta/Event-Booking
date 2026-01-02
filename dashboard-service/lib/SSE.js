class SSE {
  constructor() {
    // Map<organizationId, {response, eventsId}>
    this.clients = new Map();
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

  sendToOrganization(organizationId, eventType, data) {
    try {
      const client = this.clients.get(organizationId);
      if (!client) {
        console.log(
          `⚠️ No client connected for organization ${organizationId}`
        );
        return;
      }

      // Only send if client is subscribed to this event OR subscribed to all events (empty set)
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
