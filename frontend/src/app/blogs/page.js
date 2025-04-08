"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Divider,
  Chip,
  IconButton,
  Fab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import BlogCreateForm from "../../components/blogs/BlogCreateForm";
import SearchBar from "../../components/blogs/SearchBar";
import { fetchUserData } from "@/utils/auth";

export default function BLOGS() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithBlogPermission, setUserClubsWithBlogPermission] = useState([]);
  const [userBoardsWithBlogPermission, setUserBoardsWithBlogPermission] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);

  // Fetch user data on mount
  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        // Extract clubs with blogs permission
        if (result.userData?.data?.clubs) {
          const clubsWithPermission = Object.keys(result.userData.data.clubs)
            .filter(clubId => result.userData.data.clubs[clubId].blogs === true);
          setUserClubsWithBlogPermission(clubsWithPermission);
          
          // Set the first club as default if available
          if (clubsWithPermission.length > 0) {
            setSelectedClubId(clubsWithPermission[0]);
          }
        }

        // Extract boards with blogs permission
        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(result.userData.data.boards)
            .filter(boardId => result.userData.data.boards[boardId].blogs === true);
          setUserBoardsWithBlogPermission(boardsWithPermission);
          
          // Set the first board as default if available
          if (boardsWithPermission.length > 0) {
            setSelectedBoardId(boardsWithPermission[0]);
          }
        }
      }
    }
    loadUserData();
  }, []);

  // Check if user has permission to edit/delete a blog
  const hasBlogPermission = (blog) => {
    // Superadmins have all permissions
    if (isSuperAdmin) return true;

    // Check if blog belongs to a club where user has permission
    if (blog.club_id) {
      const clubId = blog.club_id._id || blog.club_id;
      if (userClubsWithBlogPermission.includes(clubId)) {
        return true;
      }
    }

    // Check if blog belongs to a board where user has permission
    if (blog.board_id) {
      const boardId = blog.board_id._id || blog.board_id;
      if (userBoardsWithBlogPermission.includes(boardId)) {
        return true;
      }
    }

    return false;
  };

  // Check if user can create blogs
  const canCreateBlogs = () => {
    return isSuperAdmin || 
           userClubsWithBlogPermission.length > 0 || 
           userBoardsWithBlogPermission.length > 0;
  };

  // Fetch blogs from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/blogs/blogs");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();

        const transformedBlogs = jsonResponse
          .map((blog) => ({
            id: blog._id,
            title: blog.title || "Untitled Blog",
            publisher: "Unknown",
            introduction: blog.introduction || "",
            mainContent: blog.main_content || "",
            conclusion: blog.conclusion || "",
            tags: blog.tags || [],
            image: blog.image || null,
            club_id: blog.club_id || null,
            board_id: blog.board_id || null,
            createdAt: new Date().toLocaleDateString(),
          }))
          .filter((blog) => blog.title !== "Untitled Blog");

        setBlogs(transformedBlogs);
        setFilteredBlogs(transformedBlogs);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Add filtering effect
  useEffect(() => {
    if (!searchQuery) {
      setFilteredBlogs(blogs);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(lowercaseQuery) ||
        blog.introduction.toLowerCase().includes(lowercaseQuery) ||
        blog.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    );

    setFilteredBlogs(filtered);
  }, [searchQuery, blogs]);

  const handleDelete = async (blogId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/blogs/blogs/${blogId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedBlogs = blogs.filter((blog) => blog.id !== blogId);
      setBlogs(updatedBlogs);
      setFilteredBlogs(updatedBlogs);
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }
  };

  const handleEdit = async (blog) => {
    try {
      const response = await fetch(
        `http://localhost:5000/blogs/blogs/${blog.id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blogDetails = await response.json();

      const formData = {
        title: blogDetails.title,
        publisher: "Unknown",
        introduction: blogDetails.introduction,
        mainContent: blogDetails.main_content,
        conclusion: blogDetails.conclusion,
        tags: blogDetails.tags || [],
        blogImage: blogDetails.image || null,
        club_id: blogDetails.club_id || null,
        board_id: blogDetails.board_id || null,
      };

      setSelectedBlog({
        ...blog,
        ...formData,
      });
      setIsEditing(true);
      setOpenDialog(true);
    } catch (error) {
      console.error("Failed to fetch blog details:", error);
    }
  };

  const handleAddNew = () => {
    setSelectedBlog(null);
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = isEditing
        ? `http://localhost:5000/blogs/blogs/${selectedBlog.id}`
        : "http://localhost:5000/blogs/blogs";

      const method = isEditing ? "PUT" : "POST";

      const multipartFormData = new FormData();

      // Append all text fields
      multipartFormData.append("title", formData.title);
      multipartFormData.append("publisher", formData.publisher);
      multipartFormData.append("introduction", formData.introduction);
      multipartFormData.append("mainContent", formData.mainContent);
      multipartFormData.append("conclusion", formData.conclusion);

      // Append tags
      formData.tags.forEach((tag, index) => {
        multipartFormData.append(`tags[${index}]`, tag);
      });

      // Handle image upload
      if (formData.blogImage instanceof File) {
        multipartFormData.append("image", formData.blogImage);
      } else if (formData.blogImage && typeof formData.blogImage === "string") {
        multipartFormData.append("image", formData.blogImage);
      }

      // Append ID for editing
      if (isEditing && selectedBlog) {
        multipartFormData.append("_id", selectedBlog.id);
      }

      // Append club_id and board_id if available
      if (formData.club_id) {
        multipartFormData.append("club_id", formData.club_id);
      }
      if (formData.board_id) {
        multipartFormData.append("board_id", formData.board_id);
      }

      const response = await fetch(url, {
        method: method,
        body: multipartFormData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedBlog = await response.json();

      if (isEditing && selectedBlog) {
        const updatedBlogs = blogs.map((blog) =>
          blog.id === selectedBlog.id
            ? {
                ...updatedBlog,
                id: updatedBlog._id,
                createdAt: new Date(updatedBlog.createdAt).toLocaleDateString(),
              }
            : blog
        );
        setBlogs(updatedBlogs);
        setFilteredBlogs(updatedBlogs);
      } else {
        const newBlog = {
          ...updatedBlog,
          id: updatedBlog._id,
          createdAt: new Date(updatedBlog.createdAt).toLocaleDateString(),
        };
        const updatedBlogs = [...blogs, newBlog];
        setBlogs(updatedBlogs);
        setFilteredBlogs(updatedBlogs);
      }
      setOpenDialog(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to submit blog:", error);
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleFilterToggle = () => {};

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 2, textAlign: "center" }}>
        <Typography variant="h6">Loading blogs...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 2, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Error loading blogs: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 2, position: "relative", minHeight: "80vh" }}
    >
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onFilterToggle={handleFilterToggle}
      />

      <Grid container spacing={2}>
        {filteredBlogs.map((blog) => (
          <Grid item xs={12} sm={6} md={4} key={blog.id}>
            <Card elevation={1} sx={{ height: "100%" }}>
              <CardContent>
                {blog.image && (
                  <Box
                    component="img"
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "contain",
                      mb: 2,
                      borderRadius: 1,
                    }}
                    src={`http://localhost:5000/uploads/${blog.image.filename}`}
                    alt={blog.title}
                  />
                )}
                <Box
                  sx={{
                    mb: 1,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">{blog.title}</Typography>
                  {hasBlogPermission(blog) && (
                    <Box>
                      <IconButton
                        onClick={() => handleEdit(blog)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(blog.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  <strong>By:</strong> {blog.publisher}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {blog.tags && blog.tags.length > 0 && (
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}
                    >
                      {blog.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    <strong>Published:</strong> {blog.createdAt}
                  </Typography>
                </Box>
                <Button variant="outlined" fullWidth color="primary">
                  Read More
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {false && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAddNew}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            boxShadow: 3,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      <BlogCreateForm
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setIsEditing(false);
        }}
        onSubmit={handleFormSubmit}
        initialData={
          selectedBlog
            ? {
                title: selectedBlog.title,
                publisher: selectedBlog.publisher,
                introduction: selectedBlog.introduction,
                mainContent: selectedBlog.mainContent,
                conclusion: selectedBlog.conclusion,
                tags: selectedBlog.tags,
                image: selectedBlog.image,
              }
            : null
        }
        club_id={selectedClubId}
        board_id={selectedBoardId}
      />
    </Container>
  );
}