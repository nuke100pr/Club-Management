const express = require("express");
const router = express.Router();
const badgeController = require("../controllers/badgeController");

// Badge Routes
router.post("/badges", badgeController.createBadge);
router.get("/badges", badgeController.getAllBadges);
router.get("/badges/:id", badgeController.getBadgeById);
router.get("/users/:userId/badges", badgeController.getBadgesByUserId);
router.put("/badges/:id", badgeController.updateBadge);
router.delete("/badges/:id", badgeController.deleteBadge);

// Badge Type Routes
router.post("/badge-types", badgeController.createBadgeType);
router.get("/badge-types", badgeController.getAllBadgeTypes);
router.get("/badge-types/:id", badgeController.getBadgeTypeById);
router.put("/badge-types/:id", badgeController.updateBadgeType);
router.delete("/badge-types/:id", badgeController.deleteBadgeType);

// Special Queries
router.get("/badge-types/:typeId/badges", badgeController.getBadgesByType);

module.exports = router;
