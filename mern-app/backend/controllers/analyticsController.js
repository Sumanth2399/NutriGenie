// backend/controllers/analyticsController.js

const Meal = require("../models/mealLog");
const DailyFitnessData = require("../models/dailyFitnessData");
const mongoose = require("mongoose");
const moment = require("moment");

// ✅ 1. Daily Calories for Current Month
exports.getDailyCalories = async (req, res) => {
  try {
    const userId = req.user.id;

    const start = moment().startOf("month").toDate();
    const end = moment().endOf("month").toDate();

    console.log("userId:", userId);
console.log("start:", start);
console.log("end:", end);

const meals = await Meal.find({ userId, date: { $gte: start, $lte: end } });
console.log("meals found:", meals);
      

    const dailyCalories = {};
    meals.forEach((meal) => {
      if (!dailyCalories[meal.date]) dailyCalories[meal.date] = 0;
      dailyCalories[meal.date] += meal.totalCalories;
    });

    const sorted = Object.entries(dailyCalories)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, calories]) => ({ date, calories }));
  
  res.json(sorted);
  
  } catch (err) {
    console.error("Error fetching daily calories:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 2. Top Meals by Calories
exports.getTopMeals = async (req, res) => {
  try {
    const userId = req.user.id;


    const meals = await Meal.find({ userId });
    const flatItems = [];
    meals.forEach((meal) => {
      meal.foodItems.forEach((item) => {
        flatItems.push({
          food: item.food,
          totalCalories: (item.calories * item.quantity) / 100,
        });
      });
    });

    // Aggregate by food name
    const foodCalories = {};
    flatItems.forEach((item) => {
      if (!foodCalories[item.food]) foodCalories[item.food] = 0;
      foodCalories[item.food] += item.totalCalories;
    });

    const topMeals = Object.entries(foodCalories)
      .map(([food, totalCalories]) => ({ food, totalCalories }))
      .sort((a, b) => b.totalCalories - a.totalCalories)
      .slice(0, 10);

    res.json(topMeals);
  } catch (err) {
    console.error("Error fetching top meals:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 3. Daily Activity for Current Month
exports.getDailyActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    const start = moment().startOf("month").toDate();
    const end = moment().endOf("month").toDate();

    const activity = await DailyFitnessData.find({
      userId,
      date: { $gte: start, $lte: end },
    });

    const daily = {};
    activity.forEach((entry) => {
      const dateKey = moment(entry.date).format("YYYY-MM-DD");
      if (!daily[dateKey])
        daily[dateKey] = { steps: 0, caloriesExpended: 0, distance: 0 };

      daily[dateKey].steps += entry.steps;
      daily[dateKey].caloriesExpended += entry.caloriesExpended;
      daily[dateKey].distance += entry.distance;
    });

    res.json(daily);
  } catch (err) {
    console.error("Error fetching daily activity:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 4. Monthly Summary (Calories Consumed vs Burned)
exports.getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const year = moment().year();

    const meals = await Meal.find({ userId });
    const fitness = await DailyFitnessData.find({ userId });

    const summary = Array(12).fill(null).map((_, i) => ({
      month: i + 1,
      caloriesConsumed: 0,
      caloriesBurned: 0,
    }));

    meals.forEach((meal) => {
      const m = parseInt(moment(meal.date).month());
      if (moment(meal.date).year() === year) {
        summary[m].caloriesConsumed += meal.totalCalories;
      }
    });

    fitness.forEach((entry) => {
      const m = moment(entry.date).month();
      if (moment(entry.date).year() === year) {
        summary[m].caloriesBurned += entry.caloriesExpended;
      }
    });

    res.json(summary);
  } catch (err) {
    console.error("Error generating summary:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/analytics/meal-type-distribution
exports.getMealTypeDistribution = async (req, res) => {
    try {
      const userId = req.user.id;
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  
      const distribution = await Meal.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId), // ✅ cast userId properly
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            }
          }
        },
        {
          $group: {
            _id: "$mealType",
            count: { $sum: 1 },
            totalCalories: { $sum: "$totalCalories" }
          }
        }
      ]);
      
      console.log("Meal Type Distribution:", distribution);

      res.json(distribution);
    } catch (err) {
      console.error("Error fetching meal type distribution:", err);
      res.status(500).json({ error: "Failed to get meal type distribution" });
    }
  };

// GET /api/analytics/calories-comparison
exports.getCaloriesComparison = async (req, res) => {
    try {
      const userId = req.user.id;
      const start = moment().startOf("month").toDate();
      const end = moment().endOf("month").toDate();
  
      const fitnessData = await DailyFitnessData.find({
        userId,
        date: { $gte: start, $lte: end },
      });
  
      const meals = await Meal.find({
        userId,
        date: { $gte: start, $lte: end },
      });
  
      const caloriesBurnedMap = {};
      fitnessData.forEach((entry) => {
        const dateStr = entry.date.toISOString().split("T")[0];
        caloriesBurnedMap[dateStr] = (caloriesBurnedMap[dateStr] || 0) + entry.caloriesExpended;
      });
  
      const caloriesConsumedMap = {};
      meals.forEach((entry) => {
        const dateStr = entry.date.toISOString().split("T")[0];
        caloriesConsumedMap[dateStr] = (caloriesConsumedMap[dateStr] || 0) + entry.totalCalories;
      });
  
      const allDates = new Set([
        ...Object.keys(caloriesBurnedMap),
        ...Object.keys(caloriesConsumedMap),
      ]);
  
      const comparison = Array.from(allDates).map((date) => ({
        date,
        caloriesBurned: caloriesBurnedMap[date] || 0,
        caloriesConsumed: caloriesConsumedMap[date] || 0,
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
  
      res.json(comparison);
    } catch (err) {
      console.error("Error fetching calorie comparison:", err);
      res.status(500).json({ error: "Failed to get calories comparison" });
    }
  };
  
  
