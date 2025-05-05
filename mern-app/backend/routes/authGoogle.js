const express = require("express");
const { googleAuth, googleAuthCallback, getGoogleToken } = require("../controllers/googleAuthController");

const router = express.Router();

// ✅ Initiate Google OAuth Authentication
router.get("/google", googleAuth);

// ✅ Handle OAuth Callback
router.get("/google/callback", googleAuthCallback);

// ✅ Fetch Stored Google Fit Token
router.get("/google-token", getGoogleToken);

module.exports = router;
