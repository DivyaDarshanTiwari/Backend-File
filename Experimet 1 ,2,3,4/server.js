"use strict";

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const mongodb = require("mongoose");
const morgan = require("morgan");

app.use(morgan("dev"));

// Import routes
const login = require("./routes/login");
const signup = require("./routes/SignUp");
const deletion = require("./routes/delete");
const updation = require("./routes/updation");
const get = require("./routes/get");
const { authenticateToken } = require("./middlewares/authMiddleware");

app.use(express.json());

// Connect to MongoDB
const connectDB = require("./config/MongoDB_Connection");
connectDB(mongodb);

// Use routes
app.use("/login", login);
app.use("/signup", signup);
app.use("/delete", deletion);
app.use("/update", updation);
app.use("/get", authenticateToken, get);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Connected to the port ${port}`);
});
