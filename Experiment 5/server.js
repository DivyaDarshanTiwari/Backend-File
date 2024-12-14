"use strict";

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Joi = require("joi");
const path = require("path");
const fs = require("fs");
const app = express();

// Serve static files (like uploaded files)
app.use(express.static("public"));
app.use(express.json());

// MongoDB connection
const uri = "mongodb://localhost:27017/Judoka"; // Specify the database name here

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Could not connect to MongoDB:", err));

// Schema and Model
const Schema = mongoose.Schema;

const testSchema = new Schema({
  name: String,
  age: Number,
  location: String,
  subject: String,
  address: String, // Added address field
  photo: String, // Store the file path in the database
});

const TestModel = mongoose.model("TestModel", testSchema);

// Joi validation schema
const userSchema = Joi.object({
  name: Joi.string().min(3).required(),
  age: Joi.date().iso().required(), // Date of birth should be a valid ISO date string
  location: Joi.string().required(),
  address: Joi.string().min(5).max(15).required(),
  subject: Joi.string().valid("backend", "dcn", "ai", "ml").required(),
});

// Multer setup for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "/uploads");
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath); // Save file in the "uploads" directory
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = Date.now() + fileExtension; // Use current timestamp for unique file names
    cb(null, fileName); // Assign the unique filename
  },
});

// Multer setup
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024, // Limit file size to 50 KB
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/pjpeg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG files are allowed"), false);
    }

    // Validate file size
    if (file.size < 5 * 1024) {
      // Reject files smaller than 5 KB
      return cb(new Error("File must be at least 5 KB"), false);
    }

    cb(null, true); // Accept the file
  },
});

// Custom Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Serve the HTML form
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "/index.html");
  res.sendFile(filePath);
});

// Handle form submission
app.post("/registration", upload.single("file"), (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { name, age, location, address, subject } = req.body;
  const dob = new Date(age);
  const today = new Date();
  const birthYear = dob.getFullYear();
  const calculatedAge =
    today.getFullYear() -
    birthYear -
    (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
      ? 1
      : 0);

  if (calculatedAge < 0 || calculatedAge > 150) {
    return next(new AppError("Invalid date of birth or unrealistic age", 400));
  }

  const file = req.file;
  if (!file) {
    return res.status(400).send("Image file is required.");
  }

  // Validate file size on the server side as well
  const fileSize = req.file.size;
  if (fileSize < 5 * 1024 || fileSize > 500 * 1024) {
    return res.status(400).send("File size must be between 5KB and 500KB.");
  }

  // Store the file path in the database
  const filePath = `/uploads/${req.file.filename}`; // The relative path to the file

  const newEntry = new TestModel({
    name,
    age: calculatedAge, // Store the calculated age
    location,
    address,
    subject,
    photo: filePath, // Save file path in the database
  });

  newEntry
    .save()
    .then((doc) => {
      console.log("Document saved:", doc);
      res.json(doc);
    })
    .catch((err) => {
      console.error("Error saving document:", err);
      res.status(500).send("Error saving document.");
    });
});

// Get user by ID
app.get("/user/:id", (req, res, next) => {
  const userId = req.params.id;
  TestModel.findById(userId)
    .then((user) => {
      if (!user) {
        return next(new AppError("User not found", 404));
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error("Error fetching user:", err);
      res.status(500).send("Error fetching user.");
    });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: "fail",
      message: err.message,
    });
  }
  console.error(err); // Log the error for debugging
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
