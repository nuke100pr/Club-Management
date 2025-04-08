// module.exports = {
//   jwtSecret: "your-secret-key-here", // Replace with a real secret key
//   backendURI: process.env.MONGO_URI || "http://localhost:3000",
// };


module.exports = {
  jwtSecret: "your-secret-key-here", // Replace with a real secret key
  
  backendURI: process.env.MONGO_URI || "http://localhost:3000",
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL 
  }
};