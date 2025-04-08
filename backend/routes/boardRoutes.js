const express = require("express");
const router = express.Router();
const boardController = require("../controllers/boardController");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Board routes
router.get("/", boardController.fetchAllBoards);
router.get("/:board_id", boardController.fetchBoardById);
router.get("/:board_id/clubs", boardController.fetchClubsByBoardId);
router.post("/", upload.single("image"), boardController.createBoard);
router.put("/:board_id", upload.single("image"), boardController.editBoard);
router.delete("/:board_id", boardController.deleteBoard);

// Follow routes
router.get("/user/:user_id", boardController.fetchBoardsByUserId);
router.post("/:board_id/follow/:user_id", boardController.followBoard);
router.delete("/:board_id/unfollow/:user_id", boardController.unfollowBoard);

module.exports = router;