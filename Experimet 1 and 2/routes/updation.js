"use strict";

const express = require("express");
const router = express.Router();
const model = require("../models/user_model");

router.put("/", async (req, res) => {
  const { useremail, newUseremail, newPassword } = req.body;
  console.log(useremail, newUseremail, newPassword);
  try {
    // Find the user by email and update fields
    const updatedUser = await model.findOneAndUpdate(
      { useremail: useremail }, // Find user by original email
      {
        $set: {
          useremail: newUseremail || useremail, // Update email (if provided)
          password: newPassword || undefined, // Update password (if provided)
        },
      },
      { new: true } // Return the updated document
    );

    if (updatedUser) {
      res
        .status(200)
        .json({ msg: "User updated successfully", user: updatedUser });
    } else {
      res.status(404).json({ msg: "No user found with the provided email" });
    }
  } catch (error) {
    console.error("Error while updating user:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
