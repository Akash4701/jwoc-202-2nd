const express = require("express");
const passport = require("../config/mentor-passport");
require("dotenv").config();
const router = express.Router();

// Logger middleware for debugging
const logger = (req, res, next) => {
  console.log(`Auth Route: ${req.method} ${req.url}`);
  console.log("Session:", req.session);
  console.log("User:", req.user);
  next();
};

// Google Authentication
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const mentorId = req.user?.id;
    if (mentorId) {
      res.redirect(`${process.env.CLIENT_URL}/dashboard?mentorId=${mentorId}`);
    } else {
      res.redirect("/login");
    }
  }
);

// GitHub Authentication
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub callback route with logger for debugging
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    const mentorId = req.user?.id;
    if (mentorId) {
      const redirectUrl = new URL("/dashboard", process.env.CLIENT_URL);
      redirectUrl.searchParams.append("mentorId", mentorId);
      res.redirect(redirectUrl.toString());
    } else {
      res.redirect("/login");
    }
  }
);

// Get Current User
router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: req.user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
});

// Logout Route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return next(err);
    }
    res.json({
      success: true,
      message: "Logout successful",
    });
  });
});

module.exports = router;
