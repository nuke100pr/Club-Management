const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/:forumId", messageController.getMessages);
router.post(
  "/",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  (req, res) => {
    const io = req.app.get('io');
    messageController.createMessage(req.body, req.files, io)
      .then(newMessage => res.status(201).json(newMessage))
      .catch(error => res.status(400).json({ error: error.message }));
  }
);
router.put("/:messageId/poll", (req, res) => {
  const io = req.app.get('io');
  messageController.updatePollVote(
    req.params.messageId,
    req.body.userId,
    req.body.optionIndex,
    req.body.voteType,
    io
  )
    .then(updatedMessage => res.status(200).json(updatedMessage))
    .catch(error => res.status(400).json({ error: error.message }));
});
router.delete("/:messageId", (req, res) => {
  const io = req.app.get('io');
  messageController.deleteMessage(req.params.messageId, req.body.userId, io)
    .then(result => res.status(200).json(result))
    .catch(error => res.status(400).json({ error: error.message }));
});

router.get("/:messageId/replies", (req, res) => {
  messageController.getReplies(
    req.params.messageId,
    req.query.page,
    req.query.limit
  )
    .then(data => res.status(200).json(data))
    .catch(error => res.status(400).json({ error: error.message }));
});

router.post(
  "/:messageId/replies",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  (req, res) => {
    const io = req.app.get('io');
    messageController.addDirectReply(
      req.params.messageId,
      req.body,
      req.files,
      io
    )
      .then(newReply => res.status(201).json({
        success: true,
        message: "Reply added successfully",
        data: newReply
      }))
      .catch(error => {
        console.error("Error adding reply:", error);
        res.status(400).json({ 
          success: false, 
          message: error.message || "Failed to add reply" 
        });
      });
  }
);

module.exports = router;