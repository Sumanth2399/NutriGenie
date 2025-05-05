require("dotenv").config();
const express = require("express");
const session = require("express-session");

const mongoose = require("mongoose");
const cors = require("cors");

const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const fitnessRoutes = require("./routes/fitnessRoutes");
const authGoogleRoutes = require("./routes/authGoogle"); 
const mealRoutes = require("./routes/mealRoutes");
const calorieRoutes = require("./routes/calorieRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");


const app = express();
app.use(
  session({
      secret: process.env.SESSION_SECRET || "supersecretkey",  // 🔥 Add this line
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }  // Set secure: true in production with HTTPS
  })
);
app.use(cors({
  origin: "http://localhost:3000",  // ✅ Allow frontend
  credentials: true,  // ✅ Allow cookies/session
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  // ✅ Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"]  // ✅ Allowed headers
}));

// ✅ HANDLE PREFLIGHT REQUESTS
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.sendStatus(204);  // ✅ No content response for preflight
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
// ✅ Fix CORS Configuration


app.use(cookieParser());

const recommendationRoutes = require("./routes/recommendationRoutes")
// Routes
app.use("/auth", authRoutes);
app.use("/api/auth", authGoogleRoutes);
app.use("/api/fitness", fitnessRoutes);
app.use("/api/meal", mealRoutes);
app.use("/api/calories", calorieRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/recommendations",recommendationRoutes);
// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
