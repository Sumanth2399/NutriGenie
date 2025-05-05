const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const verifyToken = require("../middleware/authMiddleware"); // 👈 import middleware

// 🛡️ Protected routes
router.get("/daily-calories", verifyToken, analyticsController.getDailyCalories);
router.get("/meal-type-distribution", verifyToken, analyticsController.getMealTypeDistribution);
router.get("/top-meals", verifyToken, analyticsController.getTopMeals);

router.get("/daily-activity", verifyToken, analyticsController.getDailyActivity);
router.get("/monthly-summary", verifyToken, analyticsController.getMonthlySummary);
router.get("/calories-comparison", verifyToken, analyticsController.getCaloriesComparison);

module.exports = router;
