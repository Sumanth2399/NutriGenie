const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dietaryPreference: { type: String, enum: ["Omnivore", "Vegetarian", "Vegan"], required: true },
    activityLevel: { type: String, enum: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"], required: true }
}, { timestamps: true });

module.exports = mongoose.model("UserProfile", userProfileSchema);
