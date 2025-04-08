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
  InputAdornment,
} from "@mui/material";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import BlogCreateForm from "../../components/blogs/BlogCreateForm";
import { fetchUserData } from "@/utils/auth";

export default function BLOGS({ boardId: propBoardId = null }) {
  console.log(propBoardId);
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
  const [selectedBoardId, setSelectedBoardId] = useState(propBoardId);

  const router = useRouter();

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

          // Set the first club as default if available and no board_id prop
          if (clubsWithPermission.length > 0 && !propBoardId) {
            setSelectedClubId(clubsWithPermission[0]);
          }
        }

        // Extract boards with blogs permission
        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData.data.boards
          ).filter(
            (boardId) => result.userData.data.boards[boardId].blogs === true
          );
          setUserBoardsWithBlogPermission(boardsWithPermission);

          // Set the first board as default if available and no board_id prop
          if (boardsWithPermission.length > 0 && !propBoardId) {
            setSelectedBoardId(boardsWithPermission[0]);
          }
        }
      }
    }
    loadUserData();
  }, [propBoardId]);

  const hasAddPermission = () => {};
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
    if (propBoardId) {
      if (userBoardsWithBlogPermission.includes(propBoardId)) {
        return true;
      }
      return isSuperAdmin;
    }
    return false;
  };

  // Fetch blogs from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        let url = "http://localhost:5000/blogs/blogs";

        // If a board_id prop is provided, fetch only blogs for that board
        if (propBoardId) {
          url += `?board_id=${propBoardId}`;
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
            board_id: blog.board_id || null,
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
  }, [propBoardId]);

  // Add filtering effect
  useEffect(() => {
    let filtered = [...blogs];

    // If board_id prop is provided, ensure we only show blogs for that board
    if (propBoardId) {
      filtered = filtered.filter((blog) => {
        const blogBoardId = blog.board_id?._id || blog.board_id;
        return blogBoardId === propBoardId;
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
  }, [searchQuery, blogs, propBoardId]);

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
      } else if (propBoardId) {
        // If we're in board-specific view, automatically assign to this board
        multipartFormData.append("board_id", propBoardId);
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
      <Container maxWidth="lg" sx={{ py: 3, textAlign: "center" }}>
        <Typography variant="h6">Loading blogs...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Error loading blogs: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 3, position: "relative", minHeight: "80vh" }}
    >
      <Grid container spacing={3}>
        {/* Left Panel - Search Bar (Fixed, Sticky) */}
        <Grid item xs={12} sm={3} md={3} lg={3}>
          <Paper
            sx={{
              p: 3,
              position: "sticky",
              top: 80,
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: 2,
              borderRadius: 2,
              width: "100%",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              label="Search Blogs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          </Paper>
        </Grid>

        {/* Main Content - Blog Cards */}
        <Grid item xs={12} sm={9} md={9} lg={9}>
          <Grid container spacing={3}>
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <Grid item xs={12} sm={6} md={4} key={blog.id}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      height: "100%",
                      borderRadius: 2,
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-4px)",
                      }
                    }}
                    onClick={(e) => {
                      if (e.target.closest('button, a, [role="button"]')) return;
                      router.push(`/current_blog/${blog._id}`);
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {blog.image && (
                        <Box
                          component="img"
                          sx={{
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
                            mb: 2,
                            borderRadius: 1,
                          }}
                          src={`http://localhost:5000/uploads/${blog.image.filename}`}
                          alt={blog.title}
                        />
                      )}
                      <Box
                        sx={{
                          mb: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{blog.title}</Typography>
                        {hasBlogPermission(blog) && (
                          <Box>
                            <IconButton
                              onClick={() => handleEdit(blog)}
                              color="primary"
                              size="small"
                              sx={{ mr: 0.5 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(blog.id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
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
                              mb: 2,
                            }}
                          >
                            {blog.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ borderRadius: 1 }}
                              />
                            ))}
                          </Box>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          <strong>Published:</strong> {blog.createdAt}
                        </Typography>
                      </Box>
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        color="primary"
                        sx={{ 
                          borderRadius: 1,
                          textTransform: "none",
                          fontWeight: 500
                        }}
                      >
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    No blogs found{propBoardId ? " for this board" : ""}
                  </Typography>
                  {filteredBlogs.length === 0 && searchQuery && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Try a different search term
                    </Typography>
                  )}
                </Paper>
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
        club_id={selectedClubId}
        board_id={propBoardId} // Prefer the prop board_id if provided
      />
    </Container>
  );
}
