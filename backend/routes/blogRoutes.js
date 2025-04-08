const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const multer = require("multer");

// Configure multer for file uploads
const upload = multer({
storage: multer.memoryStorage(),
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Basic CRUD Routes
router.post("/blogs",upload.single('image'), blogController.createBlog);
router.get("/blogs", blogController.getAllBlogs);
router.get("/blogs/:id", blogController.getBlogById);
router.put("/blogs/:id",upload.single('image'), blogController.updateBlog);
router.delete("/blogs/:id", blogController.deleteBlog);

// Search Routes
router.get("/blogs/search", blogController.searchBlogs);
router.get("/blogs/keyword/:keyword", blogController.getBlogsByKeyword);

module.exports = router;
