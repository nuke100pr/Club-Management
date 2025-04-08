const blogService = require("../services/blogService");

// Event Controllers
const createBlog = async (req, res) => {
  try {
    const blogData = req.body;
    const imageFile = req.file; // Assuming you're using multer for file uploads

    const blogEvent = await blogService.createBlog(blogData, imageFile);
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: blogEvent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all blog posts
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await blogService.getAllBlogs(req.query);
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single blog post by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await blogService.getBlogById(req.params.id);
    res.json(blog);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Update a blog post
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const imageFile = req.file;

    const updatedBlog = await blogService.updateBlog(id, updateData, imageFile);
    res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a blog post
const deleteBlog = async (req, res) => {
  try {
    await blogService.deleteBlog(req.params.id);
    res.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Search blog posts
const searchBlogs = async (req, res) => {
  try {
    const blogs = await blogService.searchBlogs(req.query.term);
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get blogs by keyword
const getBlogsByKeyword = async (req, res) => {
  try {
    const blogs = await blogService.getBlogsByKeyword(req.params.keyword);
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
