// controllers/calorieController.js
const { exec } = require("child_process");
const path = require("path");
const Meal = require("../models/mealLog");





// POST /get-calories
exports.getCalories = (req, res) => {
  const { food } = req.body;

  if (!food) {
    return res.status(400).json({ error: "Food name is required" });
  }

  const scriptPath = path.join(__dirname, "../utils/get_calories.py");
  const command = `python3 "${scriptPath}" calories "${food}"`;

  exec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error("🔥 Python script error:", error || stderr);
      return res.status(500).json({ error: "Error running Python script" });
    }

    try {
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (parseErr) {
      console.error("🔥 JSON parse error:", parseErr);
      res.status(500).json({ error: "Invalid response from script" });
    }
  });
};

// POST /get-suggestions
exports.getSuggestions = (req, res) => {
  const { query } = req.body;

  if (!query || query.length < 2) {
    return res.status(400).json({ error: "Query too short" });
  }

  const scriptPath = path.join(__dirname, "../utils/get_calories.py");
  const command = `python3 "${scriptPath}" suggestions "${query}"`;

  exec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error("🔥 Python script error:", error || stderr);
      return res.status(500).json({ error: "Error running Python script" });
    }

    try {
      const suggestions = JSON.parse(stdout);
      res.json(suggestions);
    } catch (e) {
      console.error("🔥 JSON parse error:", e);
      res.status(500).json({ error: "Invalid suggestion response" });
    }
  });
};
