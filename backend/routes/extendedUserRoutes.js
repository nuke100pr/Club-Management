const express = require("express");
const router = express.Router();
const userController = require("../controllers/extendedUserController");
const userFileService = require("../services/extendedUserService");

// Profile photo routes
router.post(
  "/users/:userId/profile-photo",
  userFileService.upload.single("profilePhoto"),
  userController.addProfilePhoto
);

router.put(
  "/users/:userId/profile-photo",
  userFileService.upload.single("profilePhoto"),
  userController.updateProfilePhoto
);

router.delete(
  "/users/:userId/profile-photo",
  userController.removeProfilePhoto
);

// User status route
router.put("/users/:userId/status", userController.updateUserStatus);

module.exports = router;
