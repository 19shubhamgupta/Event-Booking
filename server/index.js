const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const authRouter = require("./routes/authRouter");
const ConnectDB = require("./lib/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

dotenv.config();

app.use(
  cors('*')
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}/api/`);
  ConnectDB();
});

/* "start": "npm run start --prefix server" */
