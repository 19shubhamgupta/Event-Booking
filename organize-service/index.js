const express = require("express");
const dotenv = require("dotenv");
const ConnectDB = require("./lib/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const organizationrouter = require("./routes/organizationroter");
const pageRouter = require("./routes/pageRouter");
const kafkaConsumer = require("./lib/kafkaConsumer");
const kafkaProducer = require("./lib/kafkaProducer");
const eventStatusScheduler = require("./lib/status.update.cron");
const movieRouter = require("./routes/movieRouter");
const theaterRouter = require("./routes/theaterRouter");
const screenRouter = require("./routes/screenRouter");
const showRouter = require("./routes/showRouter");

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
app.use("/movie", movieRouter);
app.use("/theater", theaterRouter);
app.use("/screen", screenRouter);
app.use("/show", showRouter);

// health check api
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

async function startServer() {
  try {
    await ConnectDB();
    await kafkaProducer.connect();
    await kafkaConsumer.connect();
    eventStatusScheduler.init();

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
  eventStatusScheduler.stopAll();
  await kafkaProducer.disconnect();
  await kafkaConsumer.disconnect();
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
