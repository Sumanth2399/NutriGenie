const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const axios = require("axios");
const session = require("express-session");
const Big = require("big.js");
const User = require("../models/user");
const DailyFitnessData = require("../models/dailyFitnessData");
const UserFitnessInfo = require("../models/userFitnessInfo");
const UserMonthlyData = require("../models/monthlyFitnessData");

const GOOGLE_REDIRECT_URI = "http://localhost:5001/api/auth/google/callback";

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

const fetchGoogleFitData = require("../utils/fetchGoogleFitData");
const saveFitnessData = require("../utils/saveFitnessData");

// Helper function to sync and save fitness data
const syncAndSaveFitnessData = async (googleFitAccessToken) => {
    try {
        console.log("🔍 Starting Sync Process...");
        console.log("Access token", googleFitAccessToken);

        // Validate Token with Google
        const googleTokenInfoUrl = `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${googleFitAccessToken}`;
        let tokenInfo;
        try {
            const response = await axios.get(googleTokenInfoUrl);
            tokenInfo = response.data;
        } catch (tokenError) {
            console.error("❌ Token Verification Failed:", tokenError.response?.data || tokenError.message);
            return;
        }

        const googleUserId = tokenInfo.sub;
        console.log("🔹 Google User ID:", googleUserId);

        // Save token in user schema
        const user = await User.findOneAndUpdate(
            { googleUserId },
            { googleFitToken: googleFitAccessToken },
            { new: true, upsert: true }
        );

        console.log("✅ Google Fit Token Saved for User:", user?.email || "User not found");

        // 👉 Fetch from Google Fit & Save to DB
        const fitnessData = await fetchGoogleFitData(googleFitAccessToken);
        await saveFitnessData({ userId: user._id, dailyData: fitnessData });

        console.log("✅ Fitness Data Synced Successfully!");
    } catch (error) {
        console.error("🚨 Sync Process Error:", error);
    }
};


// ✅ Start Google OAuth
exports.googleAuth = (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/fitness.activity.read",
            "https://www.googleapis.com/auth/fitness.body.read",
            "https://www.googleapis.com/auth/fitness.location.read", // ✅ needed for distance data
            "https://www.googleapis.com/auth/fitness.heart_rate.read", // ✅ needed for heart rate
            "https://www.googleapis.com/auth/fitness.nutrition.read",  // optional
            "https://www.googleapis.com/auth/fitness.sleep.read",      // optional
            "https://www.googleapis.com/auth/fitness.oxygen_saturation.read" // optional
        ],
        redirect_uri: GOOGLE_REDIRECT_URI
    });
    res.json({ authUrl });
};

// ✅ Handle Google OAuth Callback
exports.googleAuthCallback = async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).json({ error: "No code parameter found in URL" });
    }

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        req.session.tokens = tokens;

        await syncAndSaveFitnessData(tokens.access_token);

        console.log("✅ OAuth Success - Redirecting...");
        res.redirect(`http://localhost:3000/dashboard?token=${tokens.access_token}`);
    } catch (error) {
        console.error("🚨 Google OAuth Error:", error);
        res.status(500).json({ error: "Google OAuth callback failed" });
    }
};

// ✅ Fetch Stored Google Fit Token
exports.getGoogleToken = (req, res) => {
    if (!req.session.tokens || !req.session.tokens.access_token) {
        return res.status(401).json({ error: "No Google Fit token found" });
    }
    res.json({ token: req.session.tokens.access_token });
};