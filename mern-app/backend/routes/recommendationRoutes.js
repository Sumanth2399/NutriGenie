const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/authMiddleware");
const UserFitnessInfo = require("../models/userFitnessInfo"); // ✅ Use UserFitnessInfo now
const DailyFitnessData = require("../models/dailyFitnessData")
const Meal = require("../models/mealLog");
const { generateRecommendations } = require("../controllers/recommendationController"); 

router.get("/", protectRoute, generateRecommendations);


// ✅ Create or Update Profile (inside UserFitnessInfo)
router.post("/profile", protectRoute, async (req, res) => {
  try {
    const { age, weight, height, gender, dietaryPreference, activityLevel } = req.body;

    const profile = await UserFitnessInfo.findOneAndUpdate(
      { userId: req.user.id },
      { age, weight, height, gender, dietaryPreference, activityLevel },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (error) {
    console.error("Profile save error:", error);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

// ✅ Fetch Full Profile + Fitness Info
router.get("/profile", protectRoute, async (req, res) => {
  try {
    const fitnessInfo = await UserFitnessInfo.findOne({ userId: req.user.id });

    if (!fitnessInfo) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(fitnessInfo);
  } catch (error) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.get("/profile", protectRoute, async (req, res) => {
    try {
      const fitnessInfo = await UserFitnessInfo.findOne({ userId: req.user.id });
  
      if (!fitnessInfo) {
        return res.status(404).json({ error: "Profile not found" });
      }
  
      res.json({
        age: fitnessInfo.age,
        weight: fitnessInfo.weight,
        height: fitnessInfo.height,
        gender: fitnessInfo.gender,
        dietaryPreference: fitnessInfo.dietaryPreference,
        activityLevel: fitnessInfo.activityLevel,
      });
    } catch (error) {
      console.error("Fetch profile error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });
  
  // ✅ GET only Meals Info
  router.get("/meals", protectRoute, async (req, res) => {
    try {
      const meals = await Meal.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(5);
      res.json(meals);
    } catch (error) {
      console.error("Fetch meals error:", error);
      res.status(500).json({ error: "Failed to fetch meals" });
    }
  });
  
  // ✅ GET only Fitness Info
  router.get("/fitness", protectRoute, async (req, res) => {
    try {
        const latestFitness = await DailyFitnessData.findOne({ 
            userId: req.user.id,
            steps: { $gt: 0 }, 
            distance: { $gt: 0 },
            caloriesExpended: { $gt: 0 }
        }).sort({ date: -1 });
        

    console.log("Latest Fitness data",latestFitness);
  
      if (!latestFitness) {
        return res.status(404).json({ error: "No fitness data found" });
      }
  
      res.json({
        totalSteps: latestFitness.steps,
        totalDistance: latestFitness.distance,
        totalCalories: latestFitness.caloriesExpended,
        // These are not available: moveMinutes, heartPoints, sleep, activityDuration
      });
    } catch (error) {
      console.error("Fetch fitness error:", error);
      res.status(500).json({ error: "Failed to fetch fitness info" });
    }
  });

module.exports = router;
