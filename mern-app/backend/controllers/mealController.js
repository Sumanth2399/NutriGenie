const Meal = require("../models/mealLog");

exports.logMeal = async (req, res) => {
  try {
    const { userId, date, mealType, foodItems, totalCalories } = req.body;

    const newMeal = new Meal({ userId, date, mealType, foodItems, totalCalories });
    await newMeal.save();

    res.status(200).json({ message: "Meal logged successfully" });
  } catch (err) {
    console.error("❌ Error saving meal log:", err);
    res.status(500).json({ error: "Failed to log meal" });
  }
};

exports.getMealsByDate = async (req, res) => {
  const { date } = req.query;
  const userId = req.user.id;

  try {
    const meals = await Meal.find({ userId, date });
    res.json(meals);
  } catch (err) {
    console.error("❌ Error fetching meals:", err);
    res.status(500).json({ error: "Error fetching meals" });
  }
};
