const mongoose = require("mongoose");
const uniqueVlidator = require("mongoose-unique-validator");
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});
userSchema.plugin(uniqueVlidator);
module.exports = mongoose.model("User", userSchema);
