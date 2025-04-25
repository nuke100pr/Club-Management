module.exports = {
  jwtSecret: "your_jwt_secret_key", // Replace with a real secret key

  backendURI: process.env.MONGO_URI || "http://localhost:3000",
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
};
