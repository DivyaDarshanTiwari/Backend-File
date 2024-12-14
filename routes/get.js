"use strict";

const express = require("express");
const router = express.Router();
const model = require("../models/user_model"); // Import the User model

// Get user data by email
router.get("/", async (req, res) => {
  const { useremail } = req.query; // Get email from query parameters

  if (!useremail) {
    return res.status(400).json({ msg: "Email is required" });
  }

  try {
    // Find the user by email
    const user = await model.findOne({ useremail: useremail });

    if (user) {
      res.status(200).json({ user }); // Return the user data
    } else {
      res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    console.error("Error while fetching user:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
