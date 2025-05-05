const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema({
  food: { type: String, required: true },
  quantity: { type: Number, required: true },
  calories: { type: Number, required: true }
});

const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  mealType: { type: String, enum: ["breakfast", "lunch", "dinner"], required: true },
  foodItems: { type: [foodItemSchema], required: true },
  totalCalories: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Meal", mealSchema);
