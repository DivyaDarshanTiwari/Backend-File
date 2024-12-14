"use strict";

const express = require("express");
const router = express.Router();
const model = require("../models/user_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { useremail, password } = req.body;
  try {
    const available = await model.findOne({ useremail: useremail });
    if (available) {
      const verify = await bcrypt.compare(password, available.password);
      if (verify) {
        const token = jwt.sign(
          { userId: available._id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1h" }
        );
        res.status(200).json({ token: token });
      } else {
        res.status(400).json({ msg: "Wrong password" });
      }
    } else {
      res
        .status(400)
        .json({ msg: "No user with the same email exists , SignUp first" });
    }
  } catch (error) {
    console.error("Error in login route:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
