"use strict";

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const model = require("../models/user_model");

router.post("/", async (req, res) => {
  const { useremail, password } = req.body;

  try {
    const existingUser = await model.findOne({ useremail: useremail });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new model({
      useremail: useremail,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ msg: "Signup successful" });
  } catch (error) {
    console.error("Error in signup route:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
