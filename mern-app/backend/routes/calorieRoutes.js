const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // if needed
const {
  getCalories,
  getSuggestions
} = require("../controllers/calorieController");

router.post("/get-calories", authMiddleware, getCalories);
router.post("/get-suggestions", authMiddleware, getSuggestions);


module.exports = router;
