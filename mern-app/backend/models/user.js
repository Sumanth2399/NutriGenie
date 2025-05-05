const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    googleUserId: { type: String, unique: true, sparse: true }, // ✅ Allow null values for non-OAuth users
    googleFitToken: { type: String, default: null } // ✅ Default null for manual registration
});

module.exports = mongoose.model("User", UserSchema);
