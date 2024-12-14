"use strict";

const express = require("express");
const router = express.Router();

router.delete("/", async (req, res) => {
  const { useremail } = req.body;

  try {
    const result = await User.findOneAndDelete({ useremail: useremail });

    if (result) {
      res.status(200).json({ msg: "User deleted successfully", user: result });
    } else {
      res.status(404).json({ msg: "No user found with the provided email" });
    }
  } catch (error) {
    console.error("Error while deleting user:", error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
