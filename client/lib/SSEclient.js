class SSEClient {
  constructor() {
    (this.baseUrl = "http://localhost:5001/dashboard/realtime-dashboard"),
      (this.eventListeners = new Map());
    this.eventSource = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect(eventsId = []) {
    const params = new URLSearchParams();
    if (eventsId.length > 0) {
      params.append("eventsId", eventsId.join(","));
    }

    const url = `${this.baseUrl}/live${
      params.toString() ? "?" + params.toString() : ""
    }`;

    //create EventSource - SSE connection with credentials to send httpOnly cookies
    this.eventSource = new EventSource(url, { withCredentials: true });

    // Handle initial connection
    this.eventSource.addEventListener("connected", (e) => {
      console.log("✅ SSE Connected:", e.data);
      this.reconnectAttempts = 0;
    });

    // Handle heartbeat
    this.eventSource.addEventListener("message", (e) => {
      // Heartbeat - do nothing
    });

    // Set up listeners for registered event types
    this.eventListeners.forEach((callbacks, eventType) => {
      this.eventSource.addEventListener(eventType, (e) => {
        const data = JSON.parse(e.data);
        callbacks.forEach((cb) => cb(data));
      });
    });

    // Handle custom events
    this.eventSource.onerror = (error) => {
      console.error("❌ SSE Error:", error);
      this.handleReconnect();
    };
  }

  on(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);

      // Add event listener to EventSource if it exists
      if (this.eventSource) {
        this.eventSource.addEventListener(eventType, (e) => {
          const data = JSON.parse(e.data);
          this.eventListeners.get(eventType).forEach((cb) => cb(data));
        });
      }
    }
    this.eventListeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    if (this.eventListeners.has(eventType)) {
      const callbacks = this.eventListeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  async updateSubscriptions(eventsId) {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ eventsId }),
      });

      if (response.ok) {
        console.log("✅ Subscriptions updated");
        return await response.json();
      }
    } catch (error) {
      console.error("Error updating subscriptions:", error);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... (Attempt ${this.reconnectAttempts})`);
      setTimeout(() => {
        this.disconnect();
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log("Disconnected from SSE");
    }
  }
}

export default SSEClient = new SSEClient();
