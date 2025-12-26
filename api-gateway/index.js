const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");

const app = express();

// API Gateway handles CORS for client
app.use(
  cors({
    origin: "http://localhost:5173", // Exact client origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy with error handling
app.use(
  "/user",
  proxy("http://localhost:5002", {
    proxyErrorHandler: function (err, res, next) {
      console.error("❌ User Service (5002) unreachable:", err.message);
      res.status(503).json({
        success: false,
        message: "User service temporarily unavailable",
      });
    },
  })
);

app.use(
  "/organize",
  proxy("http://localhost:5003", {
    proxyErrorHandler: function (err, res, next) {
      console.error("❌ Organize Service (5003) unreachable:", err.message);
      res.status(503).json({
        success: false,
        message: "Organization service temporarily unavailable",
      });
    },
  })
);

app.use(
  "/events",
  proxy("http://localhost:5004", {
    proxyErrorHandler: function (err, res, next) {
      console.error("❌ Events Service (5004) unreachable:", err.message);
      res.status(503).json({
        success: false,
        message: "Events service temporarily unavailable",
      });
    },
  })
);


//bookinng 
app.use(
  "/booking",
  proxy("http://localhost:5005", {
    proxyErrorHandler: function (err, res, next) {
      console.error("❌ Booking Service (5005) unreachable:", err.message);
      res.status(503).json({
        success: false,
        message: "Booking service temporarily unavailable",
      });
    },
  })
);

//payments
app.use(
  "/payments",
  proxy("http://localhost:5006", {
    proxyErrorHandler: function (err, res, next) {
      console.error("❌ Payment Service (5006) unreachable:", err.message);
      res.status(503).json({
        success: false,
        message: "PAYMENT service temporarily unavailable",
      });
    },
  })
);


//dashboard
app.use(
  "/dashboard",
  proxy("http://localhost:5007", {
    proxyErrorHandler: function (err, res, next) {
      console.error("❌ dashboard Service (5007) unreachable:", err.message);
      res.status(503).json({
        success: false,
        message: "dashboard service temporarily unavailable",
      });
    },
  })
);


app.listen(5001, () => {
  console.log(`✅ API Gateway listening on port 5001`);
});
