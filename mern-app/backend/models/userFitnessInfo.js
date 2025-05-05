const mongoose = require("mongoose");

const userFitnessInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // ✅ make it unique since one profile per user
  },

  // 🎯 Personal Profile Fields
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  dietaryPreference: { type: String, enum: ["Omnivore", "Vegetarian", "Vegan"], required: true },
  activityLevel: { type: String, enum: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"], required: true },

  // 🎯 Fitness Tracking Fields
  totalSteps: { type: Number, default: 0 },
  totalDistance: { type: Number, default: 0 }, // in meters
  totalCalories: { type: Number, default: 0 }, // calories burned
  totalHeartRate: { type: Number, default: 0 }, 
  totalMoveMinutes: { type: Number, default: 0 },
  totalHeartPoints: { type: Number, default: 0 },
  sleep: { type: Number, default: 0 }, // sleep duration (optional)
  activityDuration: { type: Number, default: 0 } // total active minutes
}, { timestamps: true });

module.exports = mongoose.model("UserFitnessInfo", userFitnessInfoSchema);
