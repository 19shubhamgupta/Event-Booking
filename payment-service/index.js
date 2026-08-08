const express = require("express");
const dotenv = require("dotenv");
const paymentRouter = require("./routes/paymentRouter");
const cookieParser = require("cookie-parser");
const cors = require("cors");
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

app.use("/pay", paymentRouter)

// health check api
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

async function startServer() {
  try {
    await kafkaProducer.connect(); // Start listening to events

    const PORT = process.env.PORT || 5006;
    app.listen(PORT, () => {
      console.log(`Payment Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await kafkaProducer.disconnect();
  process.exit(0);
});

startServer();
