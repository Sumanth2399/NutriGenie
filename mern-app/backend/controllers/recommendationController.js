const Meal = require("../models/mealLog");
const DailyFitnessData = require("../models/dailyFitnessData");
const UserFitnessInfo = require("../models/userFitnessInfo");
const fs = require("fs");
const path = require("path");
const csv = require("csvtojson");

exports.generateRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("[INFO] Generating recommendations for user:", userId);

    // ✅ Fetch recent meals
    const meals = await Meal.find({ userId }).sort({ date: -1 }).limit(5);
    console.log(`[SUCCESS] Fetched ${meals.length} recent meal records`);

    // ✅ Fetch latest fitness activity from DailyFitnessData
    const latestFitness = await DailyFitnessData.findOne({
      userId,
      steps: { $gt: 0 },
      distance: { $gt: 0 },
      caloriesExpended: { $gt: 0 }
    }).sort({ date: -1 });

    if (!latestFitness) {
      console.log("[WARN] No valid DailyFitnessData found for user");
      return res.status(400).json({ error: "No fitness activity found. Please sync your activity data." });
    }

    console.log("[SUCCESS] Latest Fitness Data:", latestFitness);

    // ✅ Fetch user profile from UserFitnessInfo
    const fitnessInfo = await UserFitnessInfo.findOne({ userId });

    if (!fitnessInfo) {
      console.log("[WARN] No user profile info found");
      return res.status(400).json({ error: "User profile incomplete. Please complete your profile." });
    }

    // ✅ Load nutrition and diet datasets
    const nutritionPath = path.join(__dirname, "../data/Food_and_Nutrition_new.csv");
    const recommendationsPath = path.join(__dirname, "../data/diet_recommendations_dataset.csv");

   


    const foodNutrition = await csv().fromFile(nutritionPath);
    const dietRecommendations = await csv().fromFile(recommendationsPath);

    console.log(`[INFO] Total foodNutrition entries: ${foodNutrition.length}`);
    console.log(`[INFO] Total dietRecommendations entries: ${dietRecommendations.length}`);

    console.log("[SUCCESS] Loaded nutrition and diet recommendation datasets");

    console.log("[INFO] Example foodNutrition entry:", foodNutrition[0]);
    console.log("[INFO] Example dietRecommendations entry:", dietRecommendations[0]);


    // ✅ Analyze meals and fitness
    const highCalorieMeals = meals.filter(m => m.totalCalories > 800);
    console.log(`[INFO] Found ${highCalorieMeals.length} high-calorie meals (>800 kcal)`);

    const lowSteps = latestFitness.steps < 5000;
    const lowDistance = latestFitness.distance < 3000;
    const lowCaloriesBurned = latestFitness.caloriesExpended < 100;

    console.log(`[INFO] Fitness Check: Steps=${latestFitness.steps}, Distance=${latestFitness.distance}, Calories=${latestFitness.caloriesExpended}`);
    console.log(`[INFO] Flags => Low Steps: ${lowSteps}, Low Distance: ${lowDistance}, Low Calories: ${lowCaloriesBurned}`);

    // ✅ Build suggestions array
    let suggestions = [];

    if (highCalorieMeals.length > 0) {
        const profileMatchedMeals = foodNutrition.filter(f => 
          f.Gender === fitnessInfo.gender &&
          f["Activity Level"] === fitnessInfo.activityLevel &&
          f["Dietary Preference"] === fitnessInfo.dietaryPreference
        ).map(f => ({
          breakfast: f["Breakfast Suggestion"] || "No suggestion",
          lunch: f["Lunch Suggestion"] || "No suggestion",
          dinner: f["Dinner Suggestion"] || "No suggestion",
          snack: f["Snack Suggestion"] || "No suggestion",
        })).slice(0, 3);
      
        if (profileMatchedMeals.length > 0) {
          suggestions.push({
            title: "Lower-Calorie Meal Suggestions",
            recommendations: profileMatchedMeals,
          });
          console.log("[SUCCESS] Added profile-based meal suggestions");
        }
      }
      
      
      
      if (lowSteps || lowDistance || lowCaloriesBurned) {
        const fitnessAdvice = [
          "Follow a Balanced Diet focusing on lean proteins, fruits, vegetables, and whole grains.",
          "Increase your fiber intake with more fruits and vegetables.",
          "Choose complex carbs like brown rice and oats over refined sugars.",
          "Stay hydrated and maintain regular meal timings.",
          "Incorporate light cardio exercises and daily walks."
        ];
      
        suggestions.push({
          title: "Activity-Based Diet Advice",
          recommendations: fitnessAdvice,   // sending 5 different tips
        });
      
        console.log("[SUCCESS] Added customized fitness-based diet advice");
      }
      
      
      
      
      

    // ✅ Send final structured response
    res.json({
      basis: "Analyzed your recent meals and most recent fitness activity.",
      profile: {
        age: fitnessInfo.age,
        weight: fitnessInfo.weight,
        height: fitnessInfo.height,
        gender: fitnessInfo.gender,
        dietaryPreference: fitnessInfo.dietaryPreference,
        activityLevel: fitnessInfo.activityLevel,
      },
      fitness: {
        totalSteps: latestFitness.steps,
        totalDistance: latestFitness.distance,
        totalCalories: latestFitness.caloriesExpended,
      },
      meals: meals,
      suggestions,
    });

  } catch (error) {
    console.error("[ERROR] Failed to generate recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
};
