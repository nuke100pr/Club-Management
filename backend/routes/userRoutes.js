const express = require("express");
const userController = require("../controllers/userController");
const userService = require("../services/userService");
const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Helper to generate 10-digit alphanumeric password with special characters
function generateRandomPassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Auth routes
router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);

// Google OAuth routes
router.get("/auth/google", userController.googleAuth);
router.get("/auth/google/callback", userController.googleAuthCallback);

// Auth success handler
router.get("/auth/success", async (req, res) => {
  try {
    const { user } = req.query;
    if (!user) return res.redirect(`${FRONTEND_URL}/login`);

    const parsedUser = JSON.parse(user);
    const email = parsedUser?.email || "";
    const name = parsedUser?.name || "New User";

    // Check if the email belongs to iitrpr domain
    // if (!email.endsWith("@iitrpr.ac.in")) {
    //   return res.redirect(`${FRONTEND_URL}/wrong`);
    // }

    // Check if the user already exists
    let existingUser = await userService.fetchUserByEmail(email);

    if (!existingUser) {
      const randomPassword = generateRandomPassword();
      existingUser = await userService.createUser({
        name,
        email_id: email,
        password: randomPassword,
        department: "",
      });
    }
  
    return res.redirect(`${FRONTEND_URL}/home?id=${existingUser._id}`);
  } catch (err) {
    console.error("Auth success error:", err);

    return res.redirect(`${FRONTEND_URL}/login`);
  }
});

// Public routes
router.post("/users", userController.createUser);
router.get("/users", userController.fetchAllUsers);
router.get("/users/club/:club_id", userController.fetchUsersByClubId);
router.get("/users/:user_id/details", userController.fetchUserDetails);
router.get("/users/email/:email", userController.getUserByEmail);

// Protected routes (if needed in future)
router.delete("/users/:id", userController.deleteUser);
router.put("/users/:id", userController.editUser);
router.put("/users/:user_id/details", userController.editUserDetails);
router.post("/users/:user_id/follow/:club_id", userController.followClub);
router.delete("/users/:user_id/unfollow/:club_id", userController.unfollowClub);
router.post("/users/:user_id/like/:post_id", userController.likePost);
router.get("/users/:user_id/like/:post_id", userController.fetchLike);
router.delete("/users/:user_id/unlike/:post_id", userController.unlikePost);


router.post('/assign-club-admin', userController.assignClubAdmin);
router.post('/assign-board-admin', userController.assignBoardAdmin);
router.post('/assign-super-admin', userController.assignSuperAdmin);
router.patch('/remove-admin/:userId', userController.removeAdminRole);

module.exports = router;
