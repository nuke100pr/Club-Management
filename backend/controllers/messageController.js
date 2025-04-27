const Message = require("../models/Message");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Helper function to save uploaded files
const saveFile = (file, type) => {
  if (!file) return null;

  const uploadDir = path.join(__dirname, "../uploads", type);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${uuidv4()}-${file.originalname}`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, file.buffer);

  return {
    originalName: file.originalname,
    filename,
    mimetype: file.mimetype,
    path: `/uploads/${type}/${filename}`,
    size: file.size,
  };
};

module.exports = {
  async getMessages(req, res) {
    try {
      const forumId = req.params.forumId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 1000;

      if (!mongoose.Types.ObjectId.isValid(forumId)) {
        return res.status(400).json({ error: "Invalid forum ID format" });
      }

      const forum_id = new mongoose.Types.ObjectId(forumId);
      const skip = (page - 1) * limit;

      const count = await Message.countDocuments({ forum_id, parent_id: null });

      if (count === 0) {
        return res.status(200).json({
          messages: [],
          pagination: {
            total: 0,
            page,
            limit,
            pages: 0,
          },
        });
      }

      const messages = await Message.find({
        forum_id,
        parent_id: null,
      })
        .sort({ created_at: 1 })
        .skip(skip)
        .limit(limit)
        .populate("user_id")
        .populate({
          path: "replies",
          populate: {
            path: "user_id",
            model: "User", // Make sure this matches your User model name
          },
        });

      return res.status(200).json({
        messages,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  async createMessage(messageData, files, io) {
    try {
      const { forum_id, user_id, type, text, parent_id, poll } = messageData;

      if (!mongoose.Types.ObjectId.isValid(forum_id)) {
        throw new Error("Invalid forum ID");
      }

      const finalUserId = user_id || new mongoose.Types.ObjectId();

      // Process file uploads
      let fileData = null;
      let audioData = null;

      if (files) {
        if (files.file) {
          fileData = saveFile(files.file[0], "files");
        }
        if (files.audio) {
          audioData = saveFile(files.audio[0], "audio");
        }
      }

      // Create message object
      const messageObj = {
        forum_id,
        user_id: finalUserId,
        type,
        text,
        file: fileData,
        audio: audioData,
      };

      // Add poll data if type is poll
      if (type === "poll" && poll) {
        messageObj.poll = {
          question: poll.question,
          options: Array.isArray(poll.options)
            ? poll.options.map((opt) => ({
                text: opt,
                votes: 0,
              }))
            : [],
          type: poll.type || "single",
          totalVotes: 0,
          userVotes: [],
        };
      }

      // Handle reply
      if (parent_id && mongoose.Types.ObjectId.isValid(parent_id)) {
        messageObj.parent_id = parent_id;

        const msg = await Message.create(messageObj);

        // Populate the user details before emitting
        const newReply = await Message.findById(msg._id).populate("user_id");

        // Update parent message with the full reply data
        const updatedParent = await Message.findByIdAndUpdate(
          parent_id,
          { $push: { replies: newReply._id } },
          { new: true }
        ).populate("replies");

        // Emit socket event for new reply to both the parent message room and forum room
        if (io) {
          io.to(parent_id.toString()).emit("newReply", {
            parentId: parent_id,
            reply: newReply,
          });
          io.to(forum_id.toString()).emit("newReply", {
            parentId: parent_id,
            reply: newReply,
          });
        }

        return newReply;
      } else {
        const msg = await Message.create(messageObj);

        // Populate the user details before emitting
        const newMessage = await Message.findById(msg._id).populate("user_id");

        // Emit socket event for new message
        if (io) {
          io.to(forum_id.toString()).emit("newMessage", newMessage);
        }

        return newMessage;
      }
    } catch (error) {
      throw error;
    }
  },

  async updatePollVote(messageId, userId, optionIndex, voteType, io) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error("Message not found");
      }

      if (message.type !== "poll") {
        throw new Error("Message is not a poll");
      }

      const poll = message.poll;
      if (!poll || !poll.options || optionIndex >= poll.options.length) {
        throw new Error("Invalid poll option");
      }

      // Find existing vote by this user
      const userVoteIndex = poll.userVotes.findIndex(
        (v) => v.userId && v.userId.toString() === userId.toString()
      );

      if (poll.type === "single") {
        // Single choice poll logic
        if (
          userVoteIndex >= 0 &&
          poll.userVotes[userVoteIndex].optionIndex === optionIndex
        ) {
          poll.userVotes.splice(userVoteIndex, 1);
          poll.options[optionIndex].votes = Math.max(
            0,
            poll.options[optionIndex].votes - 1
          );
        } else if (userVoteIndex >= 0) {
          const prevOptionIndex = poll.userVotes[userVoteIndex].optionIndex;
          poll.options[prevOptionIndex].votes = Math.max(
            0,
            poll.options[prevOptionIndex].votes - 1
          );
          poll.userVotes[userVoteIndex].optionIndex = optionIndex;
          poll.options[optionIndex].votes += 1;
        } else {
          poll.userVotes.push({ userId, optionIndex });
          poll.options[optionIndex].votes += 1;
        }
      } else {
        // Multi-choice poll logic
        const userVotes = poll.userVotes.filter(
          (v) =>
            v.userId &&
            v.userId.toString() === userId.toString() &&
            v.optionIndex === optionIndex
        );

        if (userVotes.length > 0) {
          const voteToRemoveIndex = poll.userVotes.findIndex(
            (v) =>
              v.userId.toString() === userId.toString() &&
              v.optionIndex === optionIndex
          );

          if (voteToRemoveIndex >= 0) {
            poll.userVotes.splice(voteToRemoveIndex, 1);
          }

          poll.options[optionIndex].votes = Math.max(
            0,
            poll.options[optionIndex].votes - 1
          );
        } else {
          poll.userVotes.push({ userId, optionIndex });
          poll.options[optionIndex].votes += 1;
        }
      }

      // Recalculate total votes
      poll.totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

      message.markModified("poll");
      const updatedMessage = await message.save();

      // Emit socket event for poll update
      if (io) {
        io.to(message.forum_id.toString()).emit("updatePoll", updatedMessage);
        if (message.parent_id) {
          io.to(message.parent_id.toString()).emit(
            "updatePoll",
            updatedMessage
          );
        }
      }

      return updatedMessage;
    } catch (error) {
      throw error;
    }
  },

  async deleteMessage(messageId, userId, io) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error("Message not found");
      }

      // Delete all replies if any
      if (message.replies && message.replies.length > 0) {
        await Message.deleteMany({ parent_id: messageId });
      }

      // If this is a reply, remove it from parent's replies array
      if (message.parent_id) {
        await Message.findByIdAndUpdate(message.parent_id, {
          $pull: { replies: messageId },
        });
      }

      // Delete associated files
      if (message.file && message.file.path) {
        const filePath = path.join(__dirname, "..", message.file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      if (message.audio && message.audio.path) {
        const audioPath = path.join(__dirname, "..", message.audio.path);
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
      }

      // Store forum_id before deletion for socket emission
      const forumId = message.forum_id;
      const parentId = message.parent_id;

      // Delete the message
      await Message.findByIdAndDelete(messageId);

      // Emit socket event for message deletion
      if (io) {
        io.to(forumId.toString()).emit("deleteMessage", { messageId });
        if (parentId) {
          io.to(parentId.toString()).emit("deleteMessage", { messageId });
        }
      }

      return { success: true, message: "Message deleted successfully" };
    } catch (error) {
      throw error;
    }
  },

  async getReplies(messageId, page = 1, limit = 1000) {
    try {
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error("Invalid message ID");
      }

      const skip = (page - 1) * limit;

      const replies = await Message.find({
        parent_id: messageId,
      })
        .sort({ created_at: 1 })
        .skip(skip)
        .limit(limit)
        .populate("user_id");

      console.log(replies);

      const total = await Message.countDocuments({
        parent_id: messageId,
      });

      return {
        replies,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  },

  async addDirectReply(messageId, replyData, files, io) {
    try {
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error("Invalid message ID");
      }

      const parentMessage = await Message.findById(messageId);
      if (!parentMessage) {
        throw new Error("Parent message not found");
      }

      let fileData = null;
      let audioData = null;

      if (files) {
        if (files.file) {
          fileData = saveFile(files.file[0], "files");
        }
        if (files.audio) {
          audioData = saveFile(files.audio[0], "audio");
        }
      }

      const replyObj = {
        forum_id: parentMessage.forum_id,
        user_id: replyData.user_id || new mongoose.Types.ObjectId(),
        type: replyData.type || "message",
        text: replyData.text,
        file: fileData,
        audio: audioData,
        parent_id: messageId,
      };

      if (replyObj.type === "poll" && replyData.poll) {
        replyObj.poll = {
          question: replyData.poll.question,
          options: Array.isArray(replyData.poll.options)
            ? replyData.poll.options.map((opt) => ({
                text: opt,
                votes: 0,
              }))
            : [],
          type: replyData.poll.type || "single",
          totalVotes: 0,
          userVotes: [],
        };
      }

      const msg = await Message.create(replyObj);

      // Populate the user details before emitting
      const newReply = await Message.findById(msg._id).populate("user_id");
      const updatedParent = await Message.findByIdAndUpdate(
        messageId,
        { $push: { replies: newReply._id } },
        { new: true }
      ).populate("replies");

      if (!updatedParent) {
        await Message.findByIdAndDelete(newReply._id);
        throw new Error("Failed to update parent message");
      }

      // Emit socket event for new reply to both the parent message room and forum room
      if (io) {
        io.to(messageId.toString()).emit("newReply", {
          parentId: messageId,
          reply: newReply,
        });
        io.to(parentMessage.forum_id.toString()).emit("newReply", {
          parentId: messageId,
          reply: newReply,
        });
      }

      return newReply;
    } catch (error) {
      throw error;
    }
  },
};
