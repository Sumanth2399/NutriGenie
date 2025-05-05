const express = require("express");
const { register, login, getUser, logout } = require("../controllers/authController");
const protectRoute = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", protectRoute, getUser);
router.post("/logout", logout);

module.exports = router;
