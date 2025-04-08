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
  Paper,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import BlogCreateForm from "../../components/blogs/BlogCreateForm";
import { fetchUserData } from "@/utils/auth";

export default function BLOGS({ clubId: propclubId = null }) {
  console.log(propclubId);
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
  const [userClubsWithBlogPermission, setUserClubsWithBlogPermission] =
    useState([]);
  const [userBoardsWithBlogPermission, setUserBoardsWithBlogPermission] =
    useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [selectedclubId, setSelectedclubId] = useState(propclubId);

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
          const clubsWithPermission = Object.keys(
            result.userData.data.clubs
          ).filter(
            (clubId) => result.userData.data.clubs[clubId].blogs === true
          );
          setUserClubsWithBlogPermission(clubsWithPermission);

          // Set the first club as default if available and no club_id prop
          if (clubsWithPermission.length > 0 && !propclubId) {
            setSelectedClubId(clubsWithPermission[0]);
          }
        }

        // Extract boards with blogs permission
        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData.data.boards
          ).filter(
            (clubId) => result.userData.data.boards[clubId].blogs === true
          );
          setUserBoardsWithBlogPermission(boardsWithPermission);

          // Set the first board as default if available and no club_id prop
          if (boardsWithPermission.length > 0 && !propclubId) {
            setSelectedclubId(boardsWithPermission[0]);
          }
        }
      }
    }
    loadUserData();
  }, [propclubId]);

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
    if (blog.club_id) {
      const clubId = blog.club_id._id || blog.club_id;
      if (userBoardsWithBlogPermission.includes(clubId)) {
        return true;
      }
    }

    return false;
  };

  // Check if user can create blogs
  const canCreateBlogs = () => {
    if (propclubId) {
      // If viewing a specific board, check if user has permission for that board
      return isSuperAdmin || userBoardsWithBlogPermission.includes(propclubId);
    }
    return (
      isSuperAdmin ||
      userClubsWithBlogPermission.length > 0 ||
      userBoardsWithBlogPermission.length > 0
    );
  };

  // Fetch blogs from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        let url = "http://localhost:5000/blogs/blogs";

        // If a club_id prop is provided, fetch only blogs for that board
        if (propclubId) {
          url += `?club_id=${propclubId}`;
        }

        const response = await fetch(url);

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
            club_id: blog.club_id || null,
            createdAt: new Date(
              blog.createdAt || new Date()
            ).toLocaleDateString(),
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
  }, [propclubId]);

  // Add filtering effect
  useEffect(() => {
    let filtered = [...blogs];

    // If club_id prop is provided, ensure we only show blogs for that board
    if (propclubId) {
      filtered = filtered.filter((blog) => {
        const blogclubId = blog.club_id?._id || blog.club_id;
        return blogclubId === propclubId;
      });
    }

    // Apply search filter if there's a query
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(lowercaseQuery) ||
          blog.introduction.toLowerCase().includes(lowercaseQuery) ||
          (blog.tags &&
            blog.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)))
      );
    }

    setFilteredBlogs(filtered);
  }, [searchQuery, blogs, propclubId]);

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
        club_id: blogDetails.club_id || null,
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

      // Append club_id and club_id if available
      if (formData.club_id) {
        multipartFormData.append("club_id", formData.club_id);
      }
      if (formData.club_id) {
        multipartFormData.append("club_id", formData.club_id);
      } else if (propclubId) {
        // If we're in board-specific view, automatically assign to this board
        multipartFormData.append("club_id", propclubId);
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
      <Grid container spacing={2}>
        {/* Left Panel - Search Bar (Fixed, Non-Scrollable) */}
        <Grid item xs={12} sm={propclubId ? 12 : 3}>
          <Paper
            sx={{
              p: 2,
              position: "sticky",
              top: 80,
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              label="Search Blogs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>
        </Grid>

        {/* Main Content - Blog Cards */}
        <Grid item xs={12} sm={propclubId ? 12 : 9}>
          <Grid container spacing={2}>
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <Grid
                  item
                  xs={12}
                  sm={propclubId ? 6 : 6}
                  md={propclubId ? 4 : 4}
                  key={blog.id}
                >
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
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              mb: 1,
                            }}
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
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="h6" textAlign="center" sx={{ mt: 4 }}>
                  No blogs found{propclubId ? " for this board" : ""}
                </Typography>
                {filteredBlogs.length === 0 && searchQuery && (
                  <Typography textAlign="center" sx={{ mt: 2 }}>
                    Try a different search term
                  </Typography>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {canCreateBlogs() && (
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
        club_id={propclubId}
      />
    </Container>
  );
}
