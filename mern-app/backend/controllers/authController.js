const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        console.log("📌 Received Data:", req.body); // ✅ Debugging step
        const { name, email, password } = req.body;

        // ✅ Validate Required Fields
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // ✅ Check if Email Already Exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // ✅ Hash Password Before Saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create New User
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            googleUserId: null,  // ✅ Initialize as null for manual registration
            googleFitToken: null // ✅ Initialize as null for future integration
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("🚨 Registration Error:", error); // ✅ Debugging step
        res.status(500).json({ error: "User registration failed" });
    }
};




exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.cookie("token", token, { httpOnly: true });

        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Error fetching user" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
};
