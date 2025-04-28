"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BlogCreateForm from "../../../components/blogs//BlogCreateForm";
import { fetchUserData, hasPermission, getAuthToken } from "@/utils/auth";
// Material UI imports
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  alpha,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Grid,
  Breadcrumbs,
  Link,
} from "@mui/material";

// Material UI icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";

export default function BlogDetailPage() {
  const { blog_id } = useParams();
  const router = useRouter();
  const theme = useTheme();

  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [userClubsWithBlogPermission, setUserClubsWithBlogPermission] =
    useState([]);
  const [userBoardsWithBlogPermission, setUserBoardsWithBlogPermission] =
    useState([]);
  const [hasPermissionToEdit, setHasPermissionToEdit] = useState(false);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  // Fetch blog
  useEffect(() => {
    const fetchBlog = async () => {
      if (!authToken) return;
      
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/blogs/blogs/${blog_id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        });
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setBlog(data);
        console.log(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [blog_id, authToken]);

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

  // Check permission when blog or userData changes
  useEffect(() => {
    if (blog && userData) {
      const lml = async () => {
        const hasPermission = await hasBlogPermission(blog);
        setHasPermissionToEdit(hasPermission);
      };

      lml();
    }
  }, [blog, userData]);

  const hasBlogPermission = (blog) => {
    if (isSuperAdmin) return true;
    if (!userData) return false;

    const clubId = blog.club_id?._id || blog.club_id;
    const boardId = blog.board_id?._id || blog.board_id;

    return hasPermission("blogs", userData, boardId, clubId);
  };

  const handleDelete = async () => {
    if (!authToken) return;
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await fetch(`http://localhost:5000/blogs/blogs/${blog_id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      alert("Blog deleted successfully!");
      router.push("/blogs"); // Navigate back to blogs page
    } catch (err) {
      setError("Failed to delete the blog: " + err.message);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.introduction,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing content:", err);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleFormSubmit = async (formData) => {
    if (!authToken) return;
    
    try {
      const multipartFormData = new FormData();

      // Convert form data to multipart form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tags" && Array.isArray(value)) {
          value.forEach((tag, i) =>
            multipartFormData.append(`tags[${i}]`, tag)
          );
        } else if (key === "image" && value instanceof File) {
          multipartFormData.append("image", value);
        } else {
          if (key == "board_id" || key == "club_id") {
            if (!value) {
            } else {
              multipartFormData.append(key, value._id);
            }
          } else {
            multipartFormData.append(key, value);
          }
        }
      });

      const res = await fetch(`http://localhost:5000/blogs/blogs/${blog_id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: multipartFormData,
      });

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const updatedBlog = await res.json();
      setBlog(updatedBlog);
      setOpenDialog(false);
      setIsEditing(false);
      alert("Blog updated successfully!");
    } catch (err) {
      setError("Failed to update the blog: " + err.message);
    }
  };

  const handleBack = () => {
    if (
      document.referrer &&
      document.referrer.includes(window.location.origin)
    ) {
      router.back();
    }
  };

  const handleAllBlogs = () => {
    router.push("/src/app/blogs");
  };

  // Loading, error and empty states
  if (isLoading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        sx={{ bgcolor: theme.palette.background.default }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );

  if (error)
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 4, bgcolor: theme.palette.background.default }}
      >
        <Alert
          severity="error"
          sx={{
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[2],
          }}
        >
          Error: {error}
        </Alert>
      </Container>
    );

  if (!blog)
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 4, bgcolor: theme.palette.background.default }}
      >
        <Typography variant="body1" color={theme.palette.text.secondary}>
          No blog found
        </Typography>
      </Container>
    );

  // Format date properly
  const formattedDate = new Date(blog.published_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Rich text content styling
  const richTextStyles = {
    "& p": {
      mb: 3,
      color: theme.palette.text.primary,
      fontSize: "1.125rem",
      lineHeight: 1.8,
      letterSpacing: "0.011em",
    },
    "& h1": {
      fontSize: "2rem",
      mb: 3,
      mt: 4,
      fontWeight: 700,
      color: theme.palette.primary.main,
      lineHeight: 1.3,
    },
    "& h2": {
      fontSize: "1.75rem",
      mb: 3,
      mt: 4,
      fontWeight: 600,
      color: theme.palette.text.primary,
      lineHeight: 1.4,
    },
    "& h3": {
      fontSize: "1.5rem",
      mb: 2,
      mt: 3.5,
      fontWeight: 600,
      color: theme.palette.text.primary,
      lineHeight: 1.4,
    },
    "& ul, & ol": { 
      pl: 4, 
      mb: 3,
      color: theme.palette.text.primary,
      "& li": {
        marginBottom: "0.75rem",
        fontSize: "1.125rem",
        lineHeight: 1.7,
      }
    },
    "& a": {
      color: theme.palette.primary.main,
      textDecoration: "none",
      transition: "all 0.3s ease",
      borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
      "&:hover": {
        color: theme.palette.primary.dark,
        borderBottomColor: theme.palette.primary.main,
      },
    },
    "& img": {
      maxWidth: "100%",
      height: "auto",
      my: 4,
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[3],
    },
    "& blockquote": {
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      pl: 3,
      py: 2,
      my: 4,
      fontStyle: "italic",
      bgcolor: alpha(theme.palette.primary.main, 0.05),
      borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
      color: alpha(theme.palette.text.primary, 0.87),
      fontSize: "1.125rem",
    },
    "& code": {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      padding: "0.2em 0.4em",
      borderRadius: "3px",
      fontFamily: "monospace",
      fontSize: "0.9em",
      color: theme.palette.primary.dark,
    },
    "& pre": {
      backgroundColor: alpha(theme.palette.common.black, 0.05),
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      overflow: "auto",
      margin: theme.spacing(2, 0),
      "& code": {
        backgroundColor: "transparent",
        padding: 0,
        color: theme.palette.text.primary,
        fontSize: "0.9rem",
        lineHeight: 1.5,
      },
    },
  };

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        pb: 8,
      }}
    >
      {/* Navigation breadcrumbs */}
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link 
            color="inherit" 
            href="/src/app/blogs" 
            onClick={(e) => {
              e.preventDefault();
              router.push("/src/app/blogs");
            }}
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Blogs
          </Link>
          {blog.club_id && (
            <Link 
              color="inherit" 
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {blog.club_id.name}
            </Link>
          )}
          <Typography color="text.primary">{blog.title}</Typography>
        </Breadcrumbs>
      </Container>

      {/* Full width hero image section */}
      <Box
        sx={{
          width: "100%",
          height: { xs: "300px", md: "500px" },
          position: "relative",
          mb: 4,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(http://localhost:5000/uploads/${blog?.image?.filename})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              bottom: { xs: 20, md: 40 },
              left: 0, 
              width: "100%"
            }}
          >
            <Container maxWidth="lg">
              <Typography
                variant="h1"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "3.5rem" },
                  textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
                  mb: 2,
                  lineHeight: 1.2,
                }}
              >
                {blog.title}
              </Typography>
              
              <Stack
                direction="row"
                spacing={3}
                alignItems="center"
                sx={{ color: "white" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: alpha(theme.palette.primary.main, 0.8),
                    }}
                  >
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Typography 
                    variant="body1" 
                    fontWeight={500}
                    sx={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                  >
                    {blog.board_id?.name || blog.club_id?.name || "Anonymous"}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarTodayIcon fontSize="small" />
                  <Typography 
                    variant="body1"
                    sx={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                  >
                    {formattedDate}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <VisibilityIcon fontSize="small" />
                  <Typography 
                    variant="body1"
                    sx={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                  >
                    {blog.number_of_views} views
                  </Typography>
                </Stack>
              </Stack>
            </Container>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Left sidebar for mobile */}
          <Grid item xs={12} sx={{ display: { md: 'none' } }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2, overflowX: 'auto', pb: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Back
              </Button>
              
              
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Share
              </Button>
              
              {hasPermissionToEdit && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Edit
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Stack>
          </Grid>

          {/* Left sidebar for desktop */}
          <Grid 
            item 
            md={2} 
            sx={{ 
              display: { xs: 'none', md: 'block' },
              position: 'sticky',
              top: 24,
              alignSelf: 'flex-start',
            }}
          >
            <Stack spacing={2} alignItems="flex-start">
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                }}
              >
                Back
              </Button>
              
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ShareIcon />}
                onClick={handleShare}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                }}
              >
                Share
              </Button>
              
              {hasPermissionToEdit && (
                <>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                    }}
                  >
                    Edit
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                    }}
                  >
                    Delete
                  </Button>
                </>
              )}
              
              <Divider sx={{ width: '100%', my: 1 }} />
              
              {/* Categories/Tags section */}
              {blog.tags && blog.tags.length > 0 && (
                <Box sx={{ width: '100%' }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ fontWeight: 600, mb: 1.5, color: theme.palette.text.secondary }}
                  >
                    TOPICS
                  </Typography>
                  <Stack spacing={1}>
                    {blog.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          borderRadius: "16px",
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.dark,
                          fontWeight: 500,
                          justifyContent: "flex-start",
                          width: '100%',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Grid>

          {/* Main content */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 0,
                overflow: "hidden",
                bgcolor: "transparent",
                borderRadius: theme.shape.borderRadius,
              }}
            >
              {/* Tags for mobile */}
              {blog.tags && blog.tags.length > 0 && (
                <Box sx={{ mb: 3, display: { xs: 'block', md: 'none' } }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ fontWeight: 600, mb: 1.5, color: theme.palette.text.secondary }}
                  >
                    TOPICS
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {blog.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          my: 0.5,
                          borderRadius: "16px",
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.dark,
                          fontWeight: 500,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Blog metadata displayed in smaller screen */}
              <Box
                sx={{ 
                  display: { xs: 'block', md: 'none' },
                  mb: 3
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: theme.shape.borderRadius,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    divider={<Divider orientation="vertical" flexItem />}
                    sx={{ overflowX: 'auto', pb: 1 }}
                  >
                    {blog.club_id && (
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ whiteSpace: 'nowrap' }}>
                        <PeopleIcon
                          fontSize="small"
                          sx={{ color: theme.palette.secondary.main }}
                        />
                        <Typography variant="body2">
                          Club: {blog.club_id?.name}
                        </Typography>
                      </Stack>
                    )}

                    {blog.board_id && (
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ whiteSpace: 'nowrap' }}>
                        <DashboardIcon
                          fontSize="small"
                          sx={{ color: theme.palette.primary.dark }}
                        />
                        <Typography variant="body2">
                          Board: {blog.board_id?.name}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </Box>

              {/* Introduction */}
              {blog.introduction && (
                <Box sx={{ mb: 5 }}>
                  <Typography
                    component="div"
                    dangerouslySetInnerHTML={{ __html: blog.introduction }}
                    sx={{
                      ...richTextStyles,
                      fontSize: "1.25rem",
                      lineHeight: 1.8,
                      color: alpha(theme.palette.text.primary, 0.9),
                      fontWeight: 500,
                      letterSpacing: "0.011em",
                      "& p:first-of-type": {
                        fontSize: "1.35rem",
                        lineHeight: 1.7,
                        color: alpha(theme.palette.text.primary, 0.87),
                        fontWeight: 500,
                        letterSpacing: "0.011em",
                        "&::first-letter": {
                          fontSize: "3.5rem",
                          float: "left",
                          lineHeight: 0.8,
                          marginRight: "0.2em",
                          color: theme.palette.primary.main,
                          fontWeight: 700,
                        },
                      },
                    }}
                  />
                </Box>
              )}

              {/* Main Content */}
              {blog.mainContent && (
                <Box sx={{ mb: 5 }}>
                  <Box
                    dangerouslySetInnerHTML={{ __html: blog.mainContent }}
                    sx={richTextStyles}
                  />
                </Box>
              )}

              {/* Conclusion */}
              {blog.conclusion && (
                <Box sx={{ mb: 6 }}>
                  <Divider sx={{ mb: 4 }} />
                  <Box
                    dangerouslySetInnerHTML={{ __html: blog.conclusion }}
                    sx={{
                      ...richTextStyles,
                      "& p": {
                        ...richTextStyles["& p"],
                        fontSize: "1.2rem",
                        fontStyle: "italic",
                      },
                    }}
                  />
                </Box>
              )}

              {/* Author info with nicer styling */}
              {blog.author_info && (
                <Card
                  elevation={2}
                  sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: theme.shape.borderRadius,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.dark, 0.1)
                      : alpha(theme.palette.primary.light, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                        }}
                      >
                        About the Author
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                        }}
                      >
                        {blog.author_info}
                      </Typography>
                    </Box>
                    </Stack>
                </Card>
              )}
            </Paper>
          </Grid>

          {/* Right sidebar */}
          <Grid 
            item 
            md={2} 
            sx={{ 
              display: { xs: 'none', md: 'block' },
              position: 'sticky',
              top: 24,
              alignSelf: 'flex-start',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: theme.shape.borderRadius,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Details
              </Typography>

              {blog.club_id && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <PeopleIcon
                    fontSize="small"
                    sx={{ color: theme.palette.secondary.main }}
                  />
                  <Typography variant="body2">
                    Club: {blog.club_id?.name}
                  </Typography>
                </Stack>
              )}

              {blog.board_id && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <DashboardIcon
                    fontSize="small"
                    sx={{ color: theme.palette.primary.dark }}
                  />
                  <Typography variant="body2">
                    Board: {blog.board_id?.name}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <CalendarTodayIcon fontSize="small" />
                <Typography variant="body2">
                  Published: {formattedDate}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <VisibilityIcon fontSize="small" />
                <Typography variant="body2">
                  Views: {blog.number_of_views}
                </Typography>
              </Stack>
            </Paper>

            {/* Related blogs section */}
            {blog.related_blogs && blog.related_blogs.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 3,
                  borderRadius: theme.shape.borderRadius,
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 2, 
                    color: theme.palette.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Related Blogs
                </Typography>
                <Stack spacing={2}>
                  {blog.related_blogs.map((relatedBlog, index) => (
                    <Card 
                      key={index} 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4]
                        }
                      }}
                      onClick={() => router.push(`/blogs/${relatedBlog._id}`)}
                    >
                      <CardMedia
                        component="img"
                        height="100"
                        image={`http://localhost:5000/uploads/${relatedBlog.image?.filename}`}
                        alt={relatedBlog.title}
                      />
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {relatedBlog.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Edit Dialog */}
      {openDialog && (
        <BlogCreateForm
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setIsEditing(false);
          }}
          onSubmit={handleFormSubmit}
          initialData={blog}
          isEditing={isEditing}
          userClubsWithBlogPermission={userClubsWithBlogPermission}
          userBoardsWithBlogPermission={userBoardsWithBlogPermission}
          selectedClubId={selectedClubId}
          selectedBoardId={selectedBoardId}
          setSelectedClubId={setSelectedClubId}
          setSelectedBoardId={setSelectedBoardId}
        />
      )}
    </Box>
  );
}