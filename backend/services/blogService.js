const Blogs = require("../models/Blogs");
const File = require('../models/File'); 
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
  const filename = `${Date.now()}-${originalname.replace(/\s+/g, '_')}`; // Replace spaces to avoid issues
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
const createBlog = async (blogData, imageFile) => {
  try {
    // If there's an image file, save it and get the file ID
    if (imageFile) {
      const fileId = await saveFile(imageFile);
      blogData.image = fileId;
    }

    const newBlog = new Blogs(blogData);
    await newBlog.save();
    

    
    return newBlog;
  } catch (error) {
    // Clean up the uploaded file if event creation fails
    if (imageFile && blogData.image) {
      try {
        const filePath = path.join(uploadDir, imageFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    throw new Error(`Error creating event: ${error.message}`);
  }
};



const getAllBlogs = async (filters = {}) => {
  try {
    return await Blogs.find(filters)
      .populate("image")
      .populate("board_id")
      .populate("club_id")
      .sort({ published_at: -1 })
      .exec();
  } catch (error) {
    throw new Error(`Error fetching blogs: ${error.message}`);
  }
};

const getBlogById = async (id) => {
  try {
    const blog = await Blogs.findById(id);
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  } catch (error) {
    throw new Error(`Error fetching blog: ${error.message}`);
  }
};

const updateBlog = async (id, updateData, imageFile) => {
  try {
    let blog = await Blogs.findById(id);
    if (!blog) {
      throw new Error("Blog not found");
    }

    // If there's a new image file, save it and update the image reference
    if (imageFile) {
      const fileId = await saveFile(imageFile);
      updateData.image = fileId;

      // Clean up the old image file if it exists
      if (blog.image) {
        try {
          const oldFile = await File.findById(blog.image);
          if (oldFile) {
            const oldFilePath = path.join(uploadDir, oldFile.filename);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
            await File.findByIdAndDelete(blog.image);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up old file:', cleanupError);
        }
      }
    }

    // Update the blog with new data
    blog = await Blogs.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return blog;
  } catch (error) {
    // Clean up the newly uploaded file if update fails
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
        console.error('Error cleaning up new file:', cleanupError);
      }
    }
    throw new Error(`Error updating blog: ${error.message}`);
  }
};

const deleteBlog = async (id) => {
  try {
    const blog = await Blogs.findByIdAndDelete(id);
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  } catch (error) {
    throw new Error(`Error deleting blog: ${error.message}`);
  }
};

const searchBlogs = async (searchTerm) => {
  try {
    return await Blogs.find({
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { introduction: { $regex: searchTerm, $options: "i" } },
        { main_content: { $regex: searchTerm, $options: "i" } },
        { keywords: { $in: [new RegExp(searchTerm, "i")] } },
      ],
    })
      .populate("published_by")
      .populate("image")
      .populate("images")
      .sort({ published_at: -1 })
      .exec();
  } catch (error) {
    throw new Error(`Error searching blogs: ${error.message}`);
  }
};

const getBlogsByKeyword = async (keyword) => {
  try {
    return await Blogs.find({ keywords: keyword })
      .populate("published_by")
      .populate("image")
      .populate("images")
      .sort({ published_at: -1 })
      .exec();
  } catch (error) {
    throw new Error(`Error fetching blogs by keyword: ${error.message}`);
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  searchBlogs,
  getBlogsByKeyword,
};
