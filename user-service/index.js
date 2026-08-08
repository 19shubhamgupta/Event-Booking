const express = require("express");
const dotenv = require("dotenv");
const authRouter = require("./routes/authRouter");
const ConnectDB = require("./lib/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const kafkaConsumer = require("./lib/kafkaconsumer");

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

app.use("/auth", authRouter);

// health check api
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

async function startServer() {
  try {
    await ConnectDB();
    await kafkaConsumer.connect(); // Start listening to events

    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => {
      console.log(`User Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await kafkaConsumer.disconnect();
  process.exit(0);
});

startServer();
