const Message = require("../models/Message");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Helper function to save uploaded files
const saveFile = (file, type) => {
  if (!file) return null;

  const uploadDir = path.join(__dirname, "../uploads", type);

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate unique filename
  const filename = `${uuidv4()}-${file.originalname}`;
  const filepath = path.join(uploadDir, filename);

  // Write file to disk
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
  async getMessages(forumId, page = 1, limit = 1000) {
    try {
      // Convert forumId to ObjectId if it's a valid ObjectId string
      const forum_id = mongoose.Types.ObjectId.isValid(forumId)
        ? new mongoose.Types.ObjectId(forumId)
        : null;
  
      if (!forum_id) {
        throw new Error("Invalid forum ID");
      }
  
      const skip = (page - 1) * limit;
  
      // Get top-level messages (no parent_id)
      const messages = await Message.find({
        forum_id,
        parent_id: null,
      })
        .sort({ created_at: 1 })
        .skip(skip)
        .limit(limit)
        .lean();
  
      // Get total count for pagination
      const total = await Message.countDocuments({
        forum_id,
        parent_id: null,
      });
  
      return {
        messages,
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
  

  async createMessage(messageData, files) {
    try {
      const { forum_id, user_id, type, text, parent_id, poll } = messageData;


      // Validate forum_id
      if (!mongoose.Types.ObjectId.isValid(forum_id)) {
        throw new Error("Invalid forum ID");
      }

      // Create random user_id if not provided
      const finalUserId = user_id || new mongoose.Types.ObjectId();

      // Process file uploads if any
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

      // Handle reply (has parent_id)
      if (parent_id && mongoose.Types.ObjectId.isValid(parent_id)) {
        messageObj.parent_id = parent_id;

        // Create the reply message
        const newReply = await Message.create(messageObj);

        // Update parent message to add this reply to its replies array
        await Message.findByIdAndUpdate(
          parent_id,
          { $push: { replies: newReply._id } },
          { new: true }
        );

        return newReply;
      } else {
        // Create new top-level message

        const newMessage = await Message.create(messageObj);
        return newMessage;
      }
    } catch (error) {
      throw error;
    }
  },

  async updatePollVote(messageId, userId, optionIndex, voteType) {
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
        // For single choice polls

        // If user already voted for this option, remove the vote
        if (
          userVoteIndex >= 0 &&
          poll.userVotes[userVoteIndex].optionIndex === optionIndex
        ) {
          // Remove user's vote from userVotes array
          poll.userVotes.splice(userVoteIndex, 1);

          // Decrease vote count for the option
          poll.options[optionIndex].votes = Math.max(
            0,
            poll.options[optionIndex].votes - 1
          );
        }
        // If user voted for a different option, change their vote
        else if (userVoteIndex >= 0) {
          // Decrease vote from previous option
          const prevOptionIndex = poll.userVotes[userVoteIndex].optionIndex;
          poll.options[prevOptionIndex].votes = Math.max(
            0,
            poll.options[prevOptionIndex].votes - 1
          );

          // Update user's vote to new option
          poll.userVotes[userVoteIndex].optionIndex = optionIndex;

          // Increase vote for new option
          poll.options[optionIndex].votes += 1;
        }
        // If user hasn't voted before, add their vote
        else {
          poll.userVotes.push({ userId, optionIndex });
          poll.options[optionIndex].votes += 1;
        }
      } else {
        // Find all votes by this user (could be for multiple options)
        const userVotes = poll.userVotes.filter(
          (v) => v.userId && v.userId.toString() === userId.toString() && 
                 v.optionIndex === optionIndex
        );
        
        // If user already voted for this specific option, remove that vote
        if (userVotes.length > 0) {
          // Find the index of this specific vote
          const voteToRemoveIndex = poll.userVotes.findIndex(
            (v) => v.userId.toString() === userId.toString() && 
                   v.optionIndex === optionIndex
          );
          
          // Remove user's vote from userVotes array
          if (voteToRemoveIndex >= 0) {
            poll.userVotes.splice(voteToRemoveIndex, 1);
          }
          
          // Decrease vote count for the option
          poll.options[optionIndex].votes = Math.max(
            0, 
            poll.options[optionIndex].votes - 1
          );
        } 
        // If user hasn't voted for this option, add their vote
        else {
          poll.userVotes.push({ userId, optionIndex });
          poll.options[optionIndex].votes += 1;
        }
      }

      // Recalculate total votes
      poll.totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

      // Save the updated message

      message.markModified('poll');
      await message.save();

      return message;
    } catch (error) {
      throw error;
    }
  },

  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error("Message not found");
      }

      // In a real app, check permissions here
      // if (message.user_id.toString() !== userId.toString()) {
      //   throw new Error('Unauthorized to delete this message');
      // }

      // If this is a parent message with replies, we have choices:
      // 1. Delete the parent and all replies
      // 2. Keep replies but mark parent as deleted
      // For this example, we'll go with option 1

      // Delete all replies first if any
      if (message.replies && message.replies.length > 0) {
        await Message.deleteMany({ parent_id: messageId });
      }

      // If this is a reply, remove it from parent's replies array
      if (message.parent_id) {
        await Message.findByIdAndUpdate(message.parent_id, {
          $pull: { replies: messageId },
        });
      }

      // Delete any associated files
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

      // Delete the message itself
      await Message.findByIdAndDelete(messageId);

      return { success: true, message: "Message deleted successfully" };
    } catch (error) {
      throw error;
    }
  },

  async getReplies(messageId, page = 1, limit = 1000) {
    try {
      // Validate messageId
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error("Invalid message ID");
      }
      
      const skip = (page - 1) * limit;
      
      // Get replies for the specified message
      const replies = await Message.find({
        parent_id: messageId
      })
        .sort({ created_at: 1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      // Get total count for pagination
      const total = await Message.countDocuments({
        parent_id: messageId
      });
      
      return {
        replies,
        pagination: {
          total,
          page,
          limit, 
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  },
  async addDirectReply(messageId, replyData, files) {

    try {
      // Validate messageId
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error("Invalid message ID");
      }
  
      // Find the parent message
      const parentMessage = await Message.findById(messageId);
      if (!parentMessage) {
        throw new Error("Parent message not found");
      }
  
      // Process file uploads if any
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
  
      // Create reply message object with parent's forum_id
      const replyObj = {
        forum_id: parentMessage.forum_id,
        user_id: replyData.user_id || new mongoose.Types.ObjectId(),
        type: replyData.type || "message",
        text: replyData.text,
        file: fileData,
        audio: audioData,
        parent_id: messageId
      };


  
      // Add poll data if type is poll
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
  
      // Create the reply document first
      const newReply = await Message.create(replyObj);
  
      // Update parent message to add this reply to its replies array
      const updatedParent = await Message.findByIdAndUpdate(
        messageId,
        { $push: { replies: newReply } },
        { new: true }
      );
      await Message.findByIdAndDelete(newReply._id);
  
      if (!updatedParent) {
        // If parent update fails, delete the newly created reply to avoid orphaned data
        await Message.findByIdAndDelete(newReply._id);
        throw new Error("Failed to update parent message");
      }
  
      return newReply;
    } catch (error) {
      throw error;
    }
  }

};


