const express = require("express");
const router = express.Router();
const { syncFitnessData, getDailyFitnessData, getMonthlyFitnessData, saveFitnessData } = require("../controllers/fitnessController"); // ✅ Ensure this file exists and has exports
const protectRoute = require("../middleware/authMiddleware"); // ✅ Ensure middleware exists

// Check if functions exist before defining routes
if (!getDailyFitnessData || !getMonthlyFitnessData) {
    console.error("❌ ERROR: fitnessController functions are not correctly imported.");
}



router.get("/daily", protectRoute, getDailyFitnessData);
router.get("/monthly", protectRoute, getMonthlyFitnessData);


module.exports = router;
