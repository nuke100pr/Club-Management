const Opportunities = require("../models/Opportunities");
const File = require("../models/File");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const saveFile = async (file) => {
  if (!file || !file.buffer) {
    console.error("Error: No file buffer provided");
    return null;
  }

  const { originalname, mimetype, buffer, size } = file; // Ensure file.buffer is available
  const filename = `${Date.now()}-${originalname.replace(/\s+/g, "_")}`; // Replace spaces to avoid issues
  const filePath = path.join(uploadDir, filename);

  console.log("Filename:", filename);
  console.log("Saving file to:", filePath);

  try {
    fs.writeFileSync(filePath, buffer);
    console.log("File saved successfully:", filePath);
  } catch (error) {
    console.error("Error writing file:", error);
    return null;
  }

  try {
    const newFile = new File({
      filename,
      originalName: originalname,
      path: filePath,
      fileType: mimetype.startsWith("image") ? "image" : "video",
      mimeType: mimetype,
      size, // Corrected: Use size directly
    });

    await newFile.save();
    return newFile._id;
  } catch (error) {
    console.error("Error saving file to database:", error);
    return null;
  }
};

// Updated createEvent function to handle file upload
const createOpportunity = async (opportunityData, imageFile) => {
  try {
    // If there's an image file, save it and get the file ID
    if (imageFile) {
      const fileId = await saveFile(imageFile);
      opportunityData.image = fileId;
    }

    console.log(opportunityData);
    const newOpportunity = new Opportunities(opportunityData);
    // Populate the image field if it exists
    if (newOpportunity.image) {
      await newOpportunity.populate("image");
    }
    await newOpportunity.save();

    return newOpportunity;
  } catch (error) {
    // Clean up the uploaded file if event creation fails
    if (imageFile && opportunityData.image) {
      try {
        const filePath = path.join(uploadDir, imageFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }
    throw new Error(`Error creating event: ${error.message}`);
  }
};

const getAllOpportunities = async (filters = {}) => {
  try {
    return await Opportunities.find(filters).populate("image").exec();
  } catch (error) {
    throw new Error(`Error fetching opportunities: ${error.message}`);
  }
};

const getOpportunityById = async (id) => {
  try {
    const opportunity = await Opportunities.findById(id);
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }
    return opportunity;
  } catch (error) {
    throw new Error(`Error fetching opportunity: ${error.message}`);
  }
};

const updateOpportunity = async (id, updateData, imageFile) => {
  try {
    // If there's a new image file, save it and update the reference
    if (imageFile) {
      const fileId = await saveFile(imageFile);
      updateData.image = fileId;

      // Get the current opportunity to clean up the old image later
      const currentOpportunity = await Opportunities.findById(id);
      if (currentOpportunity && currentOpportunity.image) {
        // Schedule old file cleanup after successful update
        updateData.__oldImage = currentOpportunity.image;
      }
    }

    updateData.updated_at = new Date();
    const updatedOpportunity = await Opportunities.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedOpportunity) {
      throw new Error("Opportunity not found");
    }

    // Clean up old image after successful update
    if (updateData.__oldImage) {
      try {
        const oldFile = await File.findById(updateData.__oldImage);
        if (oldFile) {
          const filePath = path.join(uploadDir, oldFile.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          await File.findByIdAndDelete(updateData.__oldImage);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up old image:", cleanupError);
      }
    }

    return updatedOpportunity;
  } catch (error) {
    // Clean up the new file if it was uploaded but the update failed
    if (imageFile && updateData.image) {
      try {
        const newFile = await File.findById(updateData.image);
        if (newFile) {
          const filePath = path.join(uploadDir, newFile.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          await File.findByIdAndDelete(updateData.image);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up new image:", cleanupError);
      }
    }
    throw new Error(`Error updating opportunity: ${error.message}`);
  }
};

const deleteOpportunity = async (id) => {
  try {
    const result = await Opportunities.findByIdAndDelete(id);
    if (!result) {
      throw new Error("Opportunity not found");
    }
    return result;
  } catch (error) {
    throw new Error(`Error deleting opportunity: ${error.message}`);
  }
};

module.exports = {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
};
