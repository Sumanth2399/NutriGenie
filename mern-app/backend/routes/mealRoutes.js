const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { logMeal, getMealsByDate } = require("../controllers/mealController");

router.post("/log-meal", authMiddleware, logMeal);
router.get("/meals", authMiddleware, getMealsByDate);

module.exports = router;
