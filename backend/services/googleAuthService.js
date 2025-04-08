const User = require("../models/User");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require('dotenv').config();

// Configure Passport with Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Find if user exists with this email
        let user = await User.findOne({ email_id: profile.emails[0].value });

        if (user) {
          // User exists, return the user
          return done(null, user);
        } else {
          // Create new user with Google info
          const newUser = new User({
            name: profile.displayName,
            email_id: profile.emails[0].value,
            password: "", // Empty password for Google auth users
            registered_at: new Date().toISOString(),
            status: "active",
          });

          await newUser.save();
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Export the passport configuration
module.exports = passport;
