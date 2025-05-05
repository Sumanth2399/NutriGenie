const axios = require("axios");
const DailyFitnessData = require("../models/dailyFitnessData");
const MonthlyFitnessData = require("../models/monthlyFitnessData");
const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Fetch Daily Data from DB
exports.getDailyFitnessData = async (req, res) => {
    try {
        const userId = req.user.id;
        const dailyData = await DailyFitnessData.find({ userId }).sort({ date: 1 });

        if (!dailyData || dailyData.length === 0) {
            return res.status(404).json({ message: "No daily data found" });
        }

        res.json(dailyData); // ✅ Now returns an array
    } catch (error) {
        console.error("🚨 Error Fetching Daily Data:", error);
        res.status(500).json({ error: "Error fetching daily fitness data" });
    }
};


// ✅ Fetch Monthly Data from DB
exports.getMonthlyFitnessData = async (req, res) => {
    try {
        const userId = req.user.id; // ✅ Get user ID from token
        const monthlyData = await MonthlyFitnessData.findOne({ userId }).sort({ year: -1 });

        if (!monthlyData) {
            return res.status(404).json({ message: "No monthly data found" });
        }

        res.json(monthlyData);
    } catch (error) {
        console.error("🚨 Error Fetching Monthly Data:", error);
        res.status(500).json({ error: "Error fetching monthly fitness data" });
    }
};
