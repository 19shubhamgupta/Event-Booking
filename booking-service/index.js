const express = require("express");
const dotenv = require("dotenv");
const ConnectDB = require("./lib/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bookRouter = require("./routes/bookRouter");
const reservationRoter = require("./routes/reservationRoter");
//const kafkaConsumer = require("./lib/kafkaconsumer");

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

app.use("/book", bookRouter);
app.use("/reserve", reservationRoter);

async function startServer() {
  try {
    await ConnectDB();
    //await kafkaConsumer.connect(); // Start listening to events

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
  //await kafkaConsumer.disconnect();
  process.exit(0);
});

startServer();
