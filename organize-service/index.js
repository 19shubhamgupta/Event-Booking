const express = require("express");
const dotenv = require("dotenv");
const ConnectDB = require("./lib/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const organizationrouter = require("./routes/organizationroter");
const pageRouter = require("./routes/pageRouter");
const kafkaProducer = require("./lib/kafkaProducer");

const app = express();

dotenv.config();

// Backend service behind gateway - permissive CORS
app.use(
  cors({
    origin: true, // Allow any origin (gateway will handle client CORS)
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/organization", organizationrouter);
app.use("/page", pageRouter);

async function startServer() {
  try {
    await ConnectDB();
    await kafkaProducer.connect();

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Organization Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await kafkaProducer.disconnect();
  process.exit(0);
});

startServer();
