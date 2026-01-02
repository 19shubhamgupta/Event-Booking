const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const SSE = require("../lib/SSE");
const SSErouter = express.Router();

//live?eventsId=id1,id2,id3

SSErouter.get("/live", verifyToken, (req, res) => {
  const organizationId = req.user.organizationId;
  const eventsId = req.query.eventsId ? req.query.eventsId.split(",") : [];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Origin",
    req.headers.origin || "http://localhost:5173"
  );

  //check for this
  res.setHeader("X-Accel-Buffering", "no"); // Disable Nginx buffering

  SSE.addClient(organizationId, res, eventsId);

  //send initial success msg indicating connected successfully
  res.write(`event: connected\n`);
  res.write(
    `data: ${JSON.stringify({
      message: "Connected to real-time updates",
      userId: req.user.userId,
      timestamp: new Date(),
    })}\n\n`
  );

  // Handle client disconnect
  req.on("close", () => {
    SSE.removeClient(organizationId);
    res.end();
  });

  // Handle errors
  req.on("error", () => {
    SSE.removeClient(organizationId);
    res.end();
  });

  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch (error) {
      clearInterval(heartbeat);
      SSE.removeClient(organizationId);
    }
  }, 30000);

  res.on("close", () => {
    clearInterval(heartbeat);
  });
});

SSErouter.put("/subscriptions", verifyToken, (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Origin",
    req.headers.origin || "http://localhost:5173"
  );

  const organizationId = req.user.organizationId;
  const { eventsId } = req.body;

  if (!Array.isArray(eventsId)) {
    return res.status(400).json({ message: "eventsId must be an array" });
  }

  SSE.updateEventSubscriptions(organizationId, eventsId);

  res.json({
    success: true,
    message: "Subscriptions updated",
    subscribedTo: eventsId,
  });
});

module.exports = SSErouter;
