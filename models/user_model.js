const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  useremail: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

module.exports = mongoose.model("Lab_File_Login_Schema", UserSchema);
