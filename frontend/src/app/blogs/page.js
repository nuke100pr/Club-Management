"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Container,
  IconButton,
  Fab,
  Chip,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlogCreateForm from "../../components/blogs/BlogCreateForm";
import SearchBar from "../../components/blogs/SearchBar";
import { fetchUserData, hasPermission, getAuthToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import ShareIcon from "@mui/icons-material/Share";
import UniversalShareMenu from "../../components/shared/UniversalShareMenu";

// Define filters for blogs
const filters = ["My Clubs", "My Boards"];

export default function BLOGS() {
  const theme = useTheme();
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
  const [shareMenuAnchorEl, setShareMenuAnchorEl] = useState(null);
  const [blogToShare, setBlogToShare] = useState(null);
  const [userBoardsWithBlogPermission, setUserBoardsWithBlogPermission] =
    useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [arrayPermissions, setArrayPermissions] = useState({});
  const [canCreatePermission, setCanCreatePermission] = useState({});
  const [authToken, setAuthToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  // Fetch user data on mount
  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result);
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

          // Set the first club as default if available
          if (clubsWithPermission.length > 0) {
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

          // Set the first board as default if available
          if (boardsWithPermission.length > 0) {
            setSelectedBoardId(boardsWithPermission[0]);
          }
        }
      }
    }
    loadUserData();
  }, []);

  const handleShareClick = (event, blog) => {
    event.stopPropagation();
    setShareMenuAnchorEl(event.currentTarget);
    setBlogToShare(blog);
  };

  const handleCloseShareMenu = () => {
    setShareMenuAnchorEl(null);
    setBlogToShare(null);
  };

  // Fetch blogs from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        if (!authToken) return;
        
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/blogs/blogs`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();

        const transformedBlogs = jsonResponse
          .map((blog) => ({
            id: blog._id,
            title: blog.title || "Untitled Blog",
            publisher: {
              name: "Unknown Publisher",
              avatar: "/api/placeholder/40/40",
            },
            introduction: blog.introduction || "",
            mainContent: blog.main_content || "",
            conclusion: blog.conclusion || "",
            tags: blog.tags || [],
            image: blog.image
              ? {
                  url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/Uploads/${blog.image.filename}`,
                  alt: blog.title,
                }
              : { url: "/api/placeholder/800/500", alt: "Blog image" },
            club_id: blog.club_id || null,
            board_id: blog.board_id || null,
            createdAt: new Date(blog.published_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            views: blog?.number_of_views || 0,
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
  }, [authToken]);

  // Handle filter changes
  const handleFilterChange = (event) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({});
  };

  // Add filtering effect
  useEffect(() => {
    const lowercaseQuery = searchQuery.toLowerCase();
    const hasActiveFilters = Object.values(selectedFilters).some(Boolean);

    let filtered = blogs;

    if (searchQuery) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(lowercaseQuery) ||
          blog.introduction.toLowerCase().includes(lowercaseQuery) ||
          (blog.tags &&
            blog.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)))
      );
    }

    if (hasActiveFilters) {
      filtered = filtered.filter((blog) => {
        const matchesClubFilter = selectedFilters["My Clubs"]
          ? blog.club_id &&
            userClubsWithBlogPermission.includes(
              blog.club_id._id || blog.club_id
            )
          : true;
        const matchesBoardFilter = selectedFilters["My Boards"]
          ? blog.board_id &&
            userBoardsWithBlogPermission.includes(
              blog.board_id._id || blog.board_id
            )
          : true;

        return matchesClubFilter && matchesBoardFilter;
      });
    }

    setFilteredBlogs(filtered);
  }, [
    searchQuery,
    blogs,
    selectedFilters,
    userClubsWithBlogPermission,
    userBoardsWithBlogPermission,
  ]);

  const handleDelete = async (blogId) => {
    try {
      if (!authToken) return;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/blogs/blogs/${blogId}`,
        {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
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
      if (!authToken) return;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/blogs/blogs/${blog.id}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
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
      if (!authToken) return;
      
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/blogs/blogs/${selectedBlog.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/blogs/blogs`;

      const method = isEditing ? "PUT" : "POST";

      const multipartFormData = new FormData();

      multipartFormData.append("title", formData.title);
      multipartFormData.append("publisher", formData.publisher);
      multipartFormData.append("introduction", formData.introduction);
      multipartFormData.append("mainContent", formData.mainContent);
      multipartFormData.append("conclusion", formData.conclusion);

      formData.tags.forEach((tag, index) => {
        multipartFormData.append(`tags[${index}]`, tag);
      });

      if (formData.blogImage instanceof File) {
        multipartFormData.append("image", formData.blogImage);
      } else if (formData.blogImage && typeof formData.blogImage === "string") {
        multipartFormData.append("image", formData.blogImage);
      }

      if (isEditing && selectedBlog) {
        multipartFormData.append("_id", selectedBlog.id);
      }

      if (formData.club_id) {
        multipartFormData.append("club_id", formData.club_id);
      }
      if (formData.board_id) {
        multipartFormData.append("board_id", formData.board_id);
      }

      const response = await fetch(url, {
        method: method,
        body: multipartFormData,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
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
                image: updatedBlog.image
                  ? {
                      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/Uploads/${updatedBlog.image.filename}`,
                      alt: updatedBlog.title,
                    }
                  : { url: "/api/placeholder/800/500", alt: "Blog image" },
              }
            : blog
        );
        setBlogs(updatedBlogs);
        setFilteredBlogs(updatedBlogs);
      } else {
        const newBlog = {
          ...updatedBlog,
          id: updatedBlog._id,
          publisher: {
            name: "Unknown Publisher",
            avatar: "/api/placeholder/40/40",
          },
          createdAt: new Date(updatedBlog.createdAt).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          ),
          views: Math.floor(Math.random() * 5000),
          image: updatedBlog.image
            ? {
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/Uploads/${updatedBlog.image.filename}`,
                alt: updatedBlog.title,
              }
            : { url: "/api/placeholder/800/500", alt: "Blog image" },
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

  const handleReadMore = async (blogId) => {
    // Increment view count before navigation
    try {
      if (!authToken) return;
      
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/blogs/blogs/${blogId}/views`,
        {
          method: "PATCH",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
      );
    } catch (error) {
      console.error("Failed to update view count:", error);
      // Continue with navigation even if the view count update fails
    }

    // Navigate to the blog page
    router.push(`/current_blog/${blogId}`);
  };

  useEffect(() => {
    // Check permissions for all resources
    if (userData && filteredBlogs.length > 0) {
      filteredBlogs.forEach(async (element) => {
        const clubId = element.club_id?._id || element.club_id;
        const boardId = element.board_id?._id || element.board_id;

        // If you must use the async version of hasPermission
        const hasAccess = await hasPermission(
          "blogs",
          userData,
          boardId,
          clubId
        );

        setArrayPermissions((prev) => ({
          ...prev,
          [element._id]: hasAccess,
        }));
      });
    }
  }, [userData, filteredBlogs]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 500, color: theme.palette.primary.main }}
        >
          Loading blogs...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 500, color: theme.palette.error.main }}
        >
          Error loading blogs: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          clearFilters={clearFilters}
        />

        {filteredBlogs.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
            >
              No blogs found. Try a different search term.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ mt: 16 }}>
            {filteredBlogs.map((blog) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={blog.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 16px 32px rgba(0, 0, 0, 0.18)",
                    },
                    position: "relative",
                    border: "none",
                    bgcolor: theme.palette.background.paper,
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={blog.image.url}
                      alt={blog.image.alt}
                      sx={{
                        objectFit: "cover",
                      }}
                    />
                    {blog.tags && blog.tags.length > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        {blog.tags.slice(0, 2).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{
                              bgcolor: "rgba(255, 255, 255, 0.85)",
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                              fontSize: "0.7rem",
                              height: 24,
                            }}
                          />
                        ))}
                        {blog.tags.length > 2 && (
                          <Chip
                            label={`+${blog.tags.length - 2}`}
                            size="small"
                            sx={{
                              bgcolor: "rgba(255, 255, 255, 0.85)",
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                              fontSize: "0.7rem",
                              height: 24,
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>

                  <CardContent
                    sx={{
                      p: 3,
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      bgcolor: theme.palette.background.paper,
                    }}
                  >
                    {arrayPermissions[blog._id] && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          display: "flex",
                          gap: 1,
                          zIndex: 2,
                        }}
                      >
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(blog);
                          }}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                            color: theme.palette.primary.main,
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                            "&:hover": {
                              bgcolor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                            },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(blog.id);
                          }}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                            color: theme.palette.error.main,
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                            "&:hover": {
                              bgcolor: theme.palette.error.main,
                              color: theme.palette.error.contrastText,
                            },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}

                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        color: theme.palette.text.primary,
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "2.75rem",
                        lineHeight: 1.25,
                      }}
                    >
                      {blog.title}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          border: `2px solid ${theme.palette.divider}`,
                        }}
                      >
                        {blog.board_id?.name?.charAt(0) ||
                          blog.club_id?.name?.charAt(0)}
                      </Avatar>

                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          fontSize: "0.85rem",
                        }}
                      >
                        {blog.board_id?.name || blog.club_id?.name}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: "auto", mt: 2 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <CalendarTodayIcon
                          sx={{
                            color: theme.palette.secondary.main,
                            fontSize: "0.9rem",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: "0.75rem",
                          }}
                        >
                          {blog.createdAt}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <VisibilityIcon
                            sx={{
                              color: theme.palette.primary.main,
                              fontSize: "0.9rem",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: "0.75rem",
                              fontWeight: 500,
                            }}
                          >
                            {blog.views.toLocaleString()}
                          </Typography>
                        </Stack>
                        <IconButton
                          onClick={(e) => handleShareClick(e, blog)}
                          size="small"
                          sx={{
                            color: theme.palette.primary.main,
                            padding: 0,
                            height: 20,
                            width: 20,
                          }}
                        >
                          <ShareIcon sx={{ fontSize: "1rem" }} />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleReadMore(blog.id)}
                      sx={{
                        mt: 3,
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1,
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
                        "&:hover": {
                          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                          bgcolor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      Read Article
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {blogToShare && (
          <UniversalShareMenu
            anchorEl={shareMenuAnchorEl}
            open={Boolean(shareMenuAnchorEl)}
            onClose={handleCloseShareMenu}
            id={blogToShare.id}
            title={blogToShare.title}
            contentType="blog"
          />
        )}
      </Container>
    </Box>
  );
}
