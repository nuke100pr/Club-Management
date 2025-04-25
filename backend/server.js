const express = require("express");
const userRoutes = require("./routes/userRoutes");
const boardRoutes = require("./routes/boardRoutes");
const clubRoutes = require("./routes/clubRoutes");
const postRoutes = require("./routes/postRoutes");
const cors = require("cors");
const connectDB = require("./db");
const messageRoutes = require("./routes/messageRoutes");
const forumRoutes2 = require("./routes/forumRoutes2");
const eventAndRsvpRoutes = require("./routes/eventAndRsvpRoutes");
const projectRoutes = require("./routes/projectRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const blogRoutes = require("./routes/blogRoutes");
const statRoutes = require("./routes/statRoutes");
const porRoutes = require("./routes/porRoutes");
const miscRoutes = require("./routes/miscRoutes");
const baatRoutes = require("./routes/baatRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const eUserRoutes = require("./routes/extendedUserRoutes");
const nautiNotificationRoutes = require("./routes/nauti.notification.routes");

const notificationQueueRoutes = require("./routes/notificationQueueRoutes");
const userNotificationRoutes = require("./routes/userNotificationRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const http = require("http");
const socketio = require("socket.io");
const path = require("path");

const otpRoutes = require("./routes/otpRoutes");
const passport = require("./services/googleAuthService");
const notificationRoutes = require("./routes/notificationRoutes");
const session = require("express-session");

const app = express();
app.use(cors());

app.use(
  session({
    secret: "your_session_secret",

    resave: false,

    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());

// Helper function to get MIME type based on file extension
function getMimeType(path) {
  if (path.endsWith(".mp4")) return "video/mp4";
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".ogg")) return "video/ogg";
  if (path.endsWith(".mp3")) return "audio/mpeg";
  if (path.endsWith(".wav")) return "audio/wav";
  if (path.endsWith(".flac")) return "audio/flac";
  return "application/octet-stream"; // Default
}

// Serve static files from the uploads folder with appropriate MIME types
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res, path) => {
      // Set appropriate headers for video files
      if (
        path.endsWith(".mp4") ||
        path.endsWith(".webm") ||
        path.endsWith(".ogg")
      ) {
        res.set("Content-Type", getMimeType(path));
        res.set("Accept-Ranges", "bytes"); // Enable partial content requests
      }
      // Set appropriate headers for audio files
      else if (
        path.endsWith(".mp3") ||
        path.endsWith(".wav") ||
        path.endsWith(".flac")
      ) {
        res.set("Content-Type", getMimeType(path));
        res.set("Accept-Ranges", "bytes"); // Enable partial content requests
      }
    },
  })
);

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.IO
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust this to your client URL
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join a room based on forumId
  socket.on("joinForum", (forumId) => {
    socket.join(forumId);
    console.log(`Socket ${socket.id} joined forum ${forumId}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io available to routes
app.set("io", io);

// Routes
app.use("/notify", notificationRoutes); // app.use("/notify",authMiddleware,notificationRoutes);
app.use("/api", postRoutes);
app.use("/api/messages", messageRoutes);

app.use("/forums2", forumRoutes2);
app.use("/events",authMiddleware, eventAndRsvpRoutes);
app.use("/projects", projectRoutes);
app.use("/resources", resourceRoutes);
app.use("/opportunities", opportunityRoutes);
app.use("/blogs", blogRoutes);
app.use("/clubs", clubRoutes);
app.use("/boards", boardRoutes);
app.use("/users", userRoutes);
app.use("/stats", statRoutes);
app.use("/por2", porRoutes);
app.use("/misc", miscRoutes);
app.use("/otp", otpRoutes);
app.use("/baat", baatRoutes);
app.use("/badges", badgeRoutes);
app.use("/euser", eUserRoutes);
app.use("/notifications", nautiNotificationRoutes);

app.use("/api/notification-queue", notificationQueueRoutes);
app.use("/api/user-notifications", userNotificationRoutes);

// Connect to MongoDB and start the server
connectDB().then(() => {
  server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
});
