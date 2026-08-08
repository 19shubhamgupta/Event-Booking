const express = require("express");
const dotenv = require("dotenv");
const ConnectDB = require("./lib/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const reservationRoter = require("./routes/reservationRoter");
const inventoryRouter = require("./routes/inventoryRouter");
const kafkaConsumer = require("./lib/kafkaconsumer");
const kafkaProducer = require("./lib/kafkaProducer");

require("./lib/expireReservationCleanUp.cron");

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

app.use("/reserve", reservationRoter);
app.use("/inventory", inventoryRouter);

// health check api
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

async function startServer() {
  try {
    await ConnectDB();
    await kafkaProducer.connect(); // Connect producer first
    await kafkaConsumer.connect(); // Start listening to events

    const PORT = process.env.PORT || 5005;
    app.listen(PORT, () => {
      console.log(`Booking Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await kafkaProducer.disconnect();
  await kafkaConsumer.disconnect();
  process.exit(0);
});

startServer();
