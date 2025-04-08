const express = require("express");
const router = express.Router();
const porController = require("../controllers/miscController");

router.get("/misc1/:user_id", porController.getPrivilegesByUserId1);
// GET /misc/:user_id - Get all privileges for a user
router.get("/misc/:user_id", porController.getPrivilegesByUserId);

// GET /misc/board/:board_id - Get all privileges for a board
router.get("/misc/board/:board_id", porController.getPrivilegesByBoardId);

// GET /misc/club/:club_id - Get all privileges for a club
router.get("/misc/club/:club_id", porController.getPrivilegesByClubId);

// GET /misc/board/:board_id/counts - Get entity counts for a board
router.get("/misc/board/:board_id/counts", porController.getBoardEntityCounts);

// GET /misc/club/:club_id/counts - Get entity counts for a club
router.get("/misc/club/:club_id/counts", porController.getClubEntityCounts);

module.exports = router;