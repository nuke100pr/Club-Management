import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Stack,
  Container,
  Avatar,
  Fab,
  Skeleton,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import BlogCreateForm from "@/components/blogs/BlogCreateForm";
import { fetchUserData } from "@/utils/auth";

// Styled components (keep all existing styled components)
const StyledCard = styled(Card)(({ theme, delay }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 16,
  boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  opacity: 0,
  transform: "translateY(20px)",
  animation: `fadeIn 0.5s ease-out ${delay}s forwards`,
  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(20px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(95, 150, 230, 0.2)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  },
}));

// New styled component for skeleton cards
const SkeletonCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 16,
  boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  },
}));

const StyledChip = styled(Chip)(({ theme, colorindex }) => {
  const colors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const color = colors[colorindex % colors.length];

  return {
    height: 22,
    fontSize: "0.65rem",
    fontWeight: 500,
    backgroundColor: alpha(color, 0.1),
    color: color,
    "&:hover": {
      backgroundColor: alpha(color, 0.2),
    },
    marginRight: theme.spacing(0.75),
    marginBottom: theme.spacing(0.75),
  };
});

const GradientTypography = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  textFillColor: "transparent",
  fontWeight: 600,
  marginBottom: theme.spacing(3),
}));

const ViewButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.common.white,
  boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
  "&:hover": {
    boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
    background: `linear-gradient(90deg, ${alpha(
      theme.palette.primary.main,
      0.9
    )} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
  },
  textTransform: "none",
  fontWeight: 500,
}));

// Skeleton pulse animation
const PulseSkeleton = styled(Skeleton)(({ theme }) => ({
  animation: "pulse 1.5s ease-in-out 0.5s infinite",
  "@keyframes pulse": {
    "0%": {
      opacity: 1,
    },
    "50%": {
      opacity: 0.4,
    },
    "100%": {
      opacity: 1,
    },
  },
}));

export default function BlogCardGrid({
  clubId,
  searchQuery = "",
}) {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithBlogPermission, setUserClubsWithBlogPermission] =
    useState([]);
  const [userBoardsWithBlogPermission, setUserBoardsWithBlogPermission] =
    useState([]);
  const [selectedClubId, setSelectedClubId] = useState(clubId);
  const [cardsReady, setCardsReady] = useState(false);
  const router = useRouter();

  // Fetch user data on mount
  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        if (result.userData?.data?.clubs) {
          const clubsWithPermission = Object.keys(
            result.userData.data.clubs
          ).filter(
            (clubId) => result.userData.data.clubs[clubId].blogs === true
          );
          setUserClubsWithBlogPermission(clubsWithPermission);

          if (clubsWithPermission.length > 0 && !clubId) {
            setSelectedClubId(clubsWithPermission[0]);
          }
        }

        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData.data.boards
          ).filter(
            (boardId) => result.userData.data.boards[boardId].blogs === true
          );
          setUserBoardsWithBlogPermission(boardsWithPermission);

          if (boardsWithPermission.length > 0 && !clubId) {
            setSelectedBoardId(boardsWithPermission[0]);
          }
        }
      }
    }
    loadUserData();
  }, [clubId]);

  // Check if user has permission to edit/delete a blog
  const hasBlogPermission = (blog) => {
    if (isSuperAdmin) return true;

    if (blog.club_id) {
      const clubId = blog.club_id._id || blog.club_id;
      if (userClubsWithBlogPermission.includes(clubId)) {
        return true;
      }
    }

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
    if (isSuperAdmin) {
      return true;
    }
    if (clubId) {
      if (userBoardsWithBlogPermission.includes(clubId)) {
        return true;
      }
      return isSuperAdmin;
    }
    return false;
  };


  useEffect(() => {
    const fetchBlogs = async () => {
      let fetchStartTime = Date.now();
      setIsLoading(true);
      setShowSkeleton(true);

      try {
        let url = "http://localhost:5000/blogs/blogs";

        if (clubId) {
          url += `?club_id=${clubId}`;
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
            publisher: blog.publisher || "Unknown",
            excerpt: blog.introduction || "",
            mainContent: blog.main_content || "",
            conclusion: blog.conclusion || "",
            tags: blog.tags || [],
            image: blog.image || null,
            club_id: blog.club_id || null,
            board_id: blog.board_id || null,
            date: blog.createdAt || new Date().toISOString(),
          }))
          .filter((blog) => blog.title !== "Untitled Blog");

        setBlogs(transformedBlogs);
        setFilteredBlogs(transformedBlogs);

        // Calculate remaining time to show skeleton
        const fetchTime = Date.now() - fetchStartTime;
        const minSkeletonTime = 500; // 2 seconds minimum
        const remainingSkeletonTime = Math.max(0, minSkeletonTime - fetchTime);

        // Keep skeleton visible for at least the minimum time
        setTimeout(() => {
          setIsLoading(false);
          setShowSkeleton(false);
          setCardsReady(true);
        }, remainingSkeletonTime);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
        setError(error.message);

        // Still maintain minimum skeleton time even on error
        const fetchTime = Date.now() - fetchStartTime;
        const minSkeletonTime = 2000; // 2 seconds minimum
        const remainingSkeletonTime = Math.max(0, minSkeletonTime - fetchTime);

        setTimeout(() => {
          setIsLoading(false);
          setShowSkeleton(false);
        }, remainingSkeletonTime);
      }
    };

    fetchBlogs();
  }, [clubId]);

  // Filter blogs based on searchQuery prop and boardId
  useEffect(() => {
    let filtered = [...blogs];

    if (clubId) {
      filtered = filtered.filter((blog) => {
        const blogClubId = blog.club_id?._id || blog.club_id;
        return blogClubId === clubId;
      });
    }

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(lowercaseQuery) ||
          blog.excerpt.toLowerCase().includes(lowercaseQuery) ||
          (blog.tags &&
            blog.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)))
      );
    }

    setFilteredBlogs(filtered);
  }, [searchQuery, blogs, clubId]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

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
        publisher: blogDetails.publisher || "Unknown",
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

  const handleView = (id) => {
    router.push(`/current_blog/${id}`);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = isEditing
        ? `http://localhost:5000/blogs/blogs/${selectedBlog.id}`
        : "http://localhost:5000/blogs/blogs";

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
      } else if (clubId) {
        multipartFormData.append("board_id", clubId);
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
                date: updatedBlog.createdAt,
              }
            : blog
        );
        setBlogs(updatedBlogs);
        setFilteredBlogs(updatedBlogs);
      } else {
        const newBlog = {
          ...updatedBlog,
          id: updatedBlog._id,
          date: updatedBlog.createdAt,
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

  // Skeleton blog card component
  const BlogCardSkeleton = ({ index }) => (
    <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
      <SkeletonCard>
        <PulseSkeleton variant="rectangular" height={250} />
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box mb={1.5} display="flex">
            <PulseSkeleton
              variant="rounded"
              width={60}
              height={22}
              sx={{ mr: 1 }}
            />
            <PulseSkeleton
              variant="rounded"
              width={80}
              height={22}
              sx={{ mr: 1 }}
            />
            <PulseSkeleton variant="rounded" width={70} height={22} />
          </Box>

          <PulseSkeleton variant="text" height={60} sx={{ mb: 1 }} />
          <PulseSkeleton variant="text" height={50} sx={{ mb: 2 }} />

          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <PulseSkeleton variant="circular" width={24} height={24} />
            <PulseSkeleton variant="text" width={80} />
            <Box sx={{ mx: 0.5 }}></Box>
            <PulseSkeleton variant="text" width={100} />
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <PulseSkeleton
                variant="circular"
                width={30}
                height={30}
                sx={{ mr: 1, display: "inline-block" }}
              />
              <PulseSkeleton
                variant="circular"
                width={30}
                height={30}
                sx={{ display: "inline-block" }}
              />
            </Box>
            <PulseSkeleton variant="rounded" width={120} height={36} />
          </Stack>
        </CardContent>
      </SkeletonCard>
    </Grid>
  );

  // Render skeleton loading state
  if (showSkeleton) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <BlogCardSkeleton key={index} index={index} />
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Error loading blogs: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
      {filteredBlogs.length > 0 ? (
        <Grid container spacing={3}>
          {cardsReady &&
            filteredBlogs.map((blog, index) => (
              <Grid item xs={12} sm={6} md={4} key={blog.id}>
                <StyledCard delay={0.1 * index}>
                  {blog.image && (
                    <CardMedia
                      component="img"
                      image={`http://localhost:5000/uploads/${blog.image.filename}`}
                      alt={blog.title}
                      sx={{
                        height: 250,
                        width: "100%",
                        objectFit: "fill",
                        borderRadius: "8px", // optional
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box mb={1.5}>
                      {blog.tags.slice(0, 3).map((tag, i) => (
                        <StyledChip
                          key={i}
                          label={tag}
                          size="small"
                          colorindex={i}
                        />
                      ))}
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.3,
                        minHeight: "2.6em",
                      }}
                    >
                      {blog.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: "3em",
                      }}
                      dangerouslySetInnerHTML={{ __html: blog.excerpt }}
                    />

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={2}
                      sx={{ color: "text.secondary" }}
                    >
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: (theme) => theme.palette.primary.main,
                          fontSize: "0.75rem",
                        }}
                      >
                        {blog.publisher.charAt(0)}
                      </Avatar>
                      <Typography variant="caption">
                        {blog.publisher}
                      </Typography>
                      <Box sx={{ mx: 0.5, fontSize: "0.5rem" }}>•</Box>
                      <Typography variant="caption">
                        {formatDate(blog.date)}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        {hasBlogPermission(blog) && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(blog)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(blog.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                      <ViewButton
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleView(blog.id)}
                      >
                        View Blog
                      </ViewButton>
                    </Stack>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
        </Grid>
      ) : (
        <Typography variant="h6" textAlign="center" sx={{ mt: 4 }}>
          No blogs found{clubId ? " for this board" : ""}
          {searchQuery && (
            <Typography textAlign="center" sx={{ mt: 2 }}>
              Try a different search term
            </Typography>
          )}
        </Typography>
      )}

      {canCreateBlogs() && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAddNew}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
            "&:hover": {
              background: "linear-gradient(90deg, #3a5fc0 0%, #7b3fe9 100%)",
              boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
            width: 56,
            height: 56,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
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
                introduction: selectedBlog.excerpt,
                mainContent: selectedBlog.mainContent,
                conclusion: selectedBlog.conclusion,
                tags: selectedBlog.tags,
                image: selectedBlog.image,
              }
            : null
        }
        club_id={clubId}
      />
    </Container>
  );
}
