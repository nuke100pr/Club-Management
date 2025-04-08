"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  Button,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Menu,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Alert,
  Fab,
  Dialog,
  TextField,
  InputAdornment,
  Paper,
  Grid,
  Chip,
} from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Comment as CommentIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useRouter } from "next/navigation";
import { fetchUserData } from "@/utils/auth";
import PostEditor from "../../components/posts/PostEditor";

const API_URL = "http://localhost:5000/api";
const API_URL2 = "http://localhost:5000/uploads";

const EMOJIS = ["👍", "❤️", "😂", "🔥", "😢", "👏"];

const Posts = ({ boardId, clubId }) => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [reactions, setReactions] = useState({});
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [userReactions, setUserReactions] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [reactionMenuAnchorEl, setReactionMenuAnchorEl] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [openEditor, setOpenEditor] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [userClubsWithPostPermission, setUserClubsWithPostPermission] =
    useState([]);
  const [userBoardsWithPostPermission, setUserBoardsWithPostPermission] =
    useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        // Extract clubs with posts permission
        if (result.userData?.data?.clubs) {
          const clubsWithPermission = Object.keys(
            result.userData.data.clubs
          ).filter(
            (clubId) => result.userData.data.clubs[clubId].posts === true
          );
          setUserClubsWithPostPermission(clubsWithPermission);
        }

        // Extract boards with posts permission
        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData.data.boards
          ).filter(
            (boardId) => result.userData.data.boards[boardId].posts === true
          );
          setUserBoardsWithPostPermission(boardsWithPermission);
        }
      }
    }
    loadUserData();
    fetchPosts();
  }, []);

  useEffect(() => {
    if (boardId) {
      if (posts) {
        const filtered = posts.filter((post) => post?.board_id === boardId);
        setFilteredPosts(filtered);
      }
    } else {
      setFilteredPosts(posts);
    }
  }, [posts, boardId]);

  // Apply search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    if (!term) {
      // If search is empty, reset to original filtered by board
      if (boardId) {
        setFilteredPosts(posts.filter((post) => post?.board_id === boardId));
      } else {
        setFilteredPosts(posts);
      }
      return;
    }

    const searchFiltered = posts.filter((post) => {
      const contentMatches = post.content?.toLowerCase().includes(term);
      const titleMatches = post.title?.toLowerCase().includes(term);
      const userNameMatches = post.user?.name?.toLowerCase().includes(term);

      return contentMatches || titleMatches || userNameMatches;
    });

    // Apply board filter on top of search filter if needed
    if (boardId) {
      setFilteredPosts(
        searchFiltered.filter((post) => post?.board_id === boardId)
      );
    } else {
      setFilteredPosts(searchFiltered);
    }
  }, [searchTerm, posts, boardId]);

  // Check if user has permission to edit/delete a post
  const hasPostPermission = (post) => {
    // Superadmins have all permissions
    if (isSuperAdmin) return true;

    // Check if post belongs to the current user
    if (post.user_id === userId) return true;

    // Check if post belongs to a club where user has permission
    if (post.club_id) {
      const clubId = post.club_id._id || post.club_id;
      if (userClubsWithPostPermission.includes(clubId)) {
        return true;
      }
    }

    // Check if post belongs to a board where user has permission
    if (post?.board_id) {
      const boardId = post?.board_id?._id || post?.board_id;
      if (userBoardsWithPostPermission.includes(boardId)) {
        return true;
      }
    }

    return false;
  };

  // Check if user can create posts
  const canCreatePosts = () => {
    if (boardId) {
      if (userBoardsWithPostPermission.includes(boardId)) {
        return true;
      }
      return isSuperAdmin;
    }
    return false;
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = boardId
        ? `${API_URL}/posts?board_id=${boardId}`
        : `${API_URL}/posts`;
      const response = await fetch(url);

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const postsArray = data.posts || [];

      if (Array.isArray(postsArray)) {
        setPosts(postsArray);
        initializeReactionsAndVotes(postsArray);
      } else {
        throw new Error("Unexpected data format");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeReactionsAndVotes = (postsArray) => {
    const reactionsObj = {};
    const votesObj = {};
    const userReactionsObj = {};

    postsArray.forEach((post) => {
      reactionsObj[post._id] = {};
      userReactionsObj[post._id] = {};

      if (Array.isArray(post.reactions)) {
        post.reactions.forEach((reaction) => {
          reactionsObj[post._id][reaction.emoji] =
            (reactionsObj[post._id][reaction.emoji] || 0) + 1;

          if (reaction.user_id === userId) {
            userReactionsObj[post._id][reaction.emoji] = true;
          }
        });
      }

      votesObj[post._id] =
        post.votes?.reduce((sum, vote) => sum + (vote.vote || 0), 0) || 0;
    });

    setReactions(reactionsObj);
    setVotes(votesObj);
    setUserReactions(userReactionsObj);
  };

  const handleOpenEditor = () => {
    setPostToEdit(null);
    setOpenEditor(true);
  };

  const handleCloseEditor = () => {
    setOpenEditor(false);
    setPostToEdit(null);
  };

  const handlePostCreated = (newPost) => {
    if (postToEdit) {
      // Update existing post
      setPosts((prev) =>
        prev.map((post) => (post?._id === newPost?._id ? newPost : post))
      );
    } else {
      // Add new post
      setPosts((prev) => [newPost, ...prev]);
    }
    handleCloseEditor();
  };

  const handleEditPost = (post) => {
    setPostToEdit(post);
    setOpenEditor(true);
  };

  const handleReactionToggle = async (emoji, postId) => {
    const hasReaction = userReactions[postId]?.[emoji];

    try {
      if (hasReaction) {
        // Remove reaction
        const response = await fetch(
          `${API_URL}/api/posts/${postId}/reactions`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, emoji }),
          }
        );

        if (!response.ok) throw new Error("Failed to remove reaction");
      } else {
        // Add reaction
        const response = await fetch(
          `${API_URL}/api/posts/${postId}/reactions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, emoji }),
          }
        );

        if (!response.ok) throw new Error("Failed to add reaction");
      }

      // Optimistically update UI
      setReactions((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          [emoji]: hasReaction
            ? (prev[postId]?.[emoji] || 1) - 1
            : (prev[postId]?.[emoji] || 0) + 1,
        },
      }));

      setUserReactions((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          [emoji]: !hasReaction,
        },
      }));

      showNotification(
        hasReaction ? `Removed ${emoji} reaction` : `Added ${emoji} reaction`,
        "success"
      );
    } catch (err) {
      console.error("Error toggling reaction:", err);
      showNotification("Failed to update reaction", "error");
      // Revert optimistic update if error
      fetchPosts();
    }
    handleCloseReactionMenu();
  };

  const handleVote = async (postId, voteValue) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, vote: voteValue }),
      });

      if (!response.ok) throw new Error("Vote failed");

      const updatedPost = await response.json();

      // Update votes count
      setVotes((prev) => ({
        ...prev,
        [postId]: updatedPost.votes.reduce(
          (sum, vote) => sum + (vote.vote || 0),
          0
        ),
      }));

      showNotification(
        voteValue > 0 ? "Upvoted successfully!" : "Downvoted successfully!",
        "success"
      );
    } catch (err) {
      console.error("Error voting:", err);
      showNotification("Failed to vote", "error");
    }
  };

  const handleDelete = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Delete failed");

      setPosts((prev) => prev.filter((post) => post._id !== postId));
      showNotification("Post deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting post:", err);
      showNotification("Failed to delete post", "error");
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleOpenReactionMenu = (event, postId) => {
    setReactionMenuAnchorEl(event.currentTarget);
    setCurrentPostId(postId);
  };

  const handleCloseReactionMenu = () => {
    setReactionMenuAnchorEl(null);
    setCurrentPostId(null);
  };

  if (isNavigating)
    return (
      <LinearProgress
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: "4px",
          backgroundColor: "#E8ECF2", // Light Grey from design spec
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#0F52BA", // Primary Blue from design spec
          },
        }}
      />
    );
  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress
          size={48}
          thickness={4}
          sx={{
            color: "#0F52BA", // Primary Blue from design spec
          }}
        />
      </Box>
    );
  if (error)
    return (
      <Box
        sx={{
          textAlign: "center",
          my: 4,
          p: 4,
          bgcolor: "#FFFFFF", // White from design spec
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)", // Standard Card shadow
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: "#FF3B30", mb: 2 }} // Error color from design spec
        >
          Something went wrong
        </Typography>
        <Typography
          variant="body"
          sx={{ color: "#495366", mb: 3 }} // Dark Grey from design spec
        >
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 2,
            bgcolor: "#0F52BA", // Primary Blue
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: 600,
            padding: "12px 24px",
            borderRadius: "8px",
            textTransform: "none",
            boxShadow: "0px 4px 8px rgba(15, 82, 186, 0.2)",
            "&:hover": {
              bgcolor: "#0A3D8F", // 10% darker Primary Blue
              boxShadow: "0px 6px 12px rgba(15, 82, 186, 0.3)",
            },
          }}
          onClick={fetchPosts}
        >
          Try Again
        </Button>
      </Box>
    );

  const renderEmptyState = () => (
    <Box
      sx={{
        textAlign: "center",
        my: 6,
        p: 6,
        bgcolor: "#FFFFFF", // White from design spec
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: "#1A2A56", // Deep Navy from design spec
          mb: 2,
          fontWeight: 600,
        }}
      >
        {searchTerm
          ? "No posts match your search"
          : boardId
          ? "No posts in this board"
          : "No posts available"}
      </Typography>
      <Typography
        variant="body"
        sx={{
          color: "#495366", // Dark Grey from design spec
          mb: 4,
          maxWidth: "400px",
          mx: "auto",
        }}
      >
        {searchTerm
          ? "Try adjusting your search terms or browse all posts."
          : "Be the first to share content in this space."}
      </Typography>
      {canCreatePosts() && !searchTerm && (
        <Button
          variant="contained"
          sx={{
            mt: 2,
            bgcolor: "#0F52BA", // Primary Blue
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: 600,
            padding: "12px 32px",
            borderRadius: "8px",
            textTransform: "none",
            boxShadow: "0px 4px 8px rgba(15, 82, 186, 0.2)",
            "&:hover": {
              bgcolor: "#0A3D8F", // 10% darker Primary Blue
              boxShadow: "0px 6px 12px rgba(15, 82, 186, 0.3)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.2s ease",
          }}
          startIcon={<AddIcon />}
          onClick={handleOpenEditor}
        >
          Create First Post
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", width: "100%", position: "relative", pb: 8 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3} lg={3}>
          <Paper
            sx={{
              p: 3,
              position: "sticky",
              top: 80,
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
              },
              backgroundColor: "#FFFFFF", // White from design spec
            }}
          >
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                color: "#1A2A56", // Deep Navy from design spec
                fontWeight: 600,
              }}
            >
              Search
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#A7B3CA" }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setSearchTerm("")}
                      size="small"
                    >
                      <ClearIcon sx={{ color: "#A7B3CA" }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "#F7F9FC", // Soft Grey from design spec
                  "&:hover": {
                    backgroundColor: "#F7F9FC",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E8ECF2", // Light Grey from design spec
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0F52BA", // Primary Blue from design spec
                    borderWidth: "2px",
                  },
                },
              }}
              sx={{
                mb: 2,
                "& .MuiInputLabel-root": {
                  color: "#A7B3CA", // Medium Grey from design spec
                },
              }}
            />
            {searchTerm && (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setSearchTerm("")}
                  sx={{
                    color: "#0F52BA", // Primary Blue from design spec
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "#E6F0FF", // Light blue background
                    },
                    textTransform: "none",
                  }}
                  startIcon={<ClearIcon fontSize="small" />}
                >
                  Clear Search
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={9} lg={9}>
          {filteredPosts.length === 0
            ? renderEmptyState()
            : filteredPosts.map((post) => (
                <Card
                  key={post._id}
                  sx={{
                    mb: 3,
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
                      transform: "translateY(-2px)",
                    },
                    border: "none",
                    backgroundColor: "#FFFFFF", // White from design spec
                  }}
                  onClick={(e) => {
                    if (e.target.closest('button, a, [role="button"]')) return;
                    router.push(`/current_post/${post._id}`);
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderBottom: `1px solid #E8ECF2`, // Light Grey from design spec
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={post.user?.avatar}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: post.user?.avatar ? "transparent" : "#0F52BA", // Primary Blue from design spec
                          color: "#FFFFFF",
                          fontWeight: 600,
                          fontSize: "18px",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {post.user?.name?.charAt(0) || "U"}
                      </Avatar>
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "#1A2A56", // Deep Navy from design spec
                          }}
                        >
                          {post.user?.name || "Anonymous"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#A7B3CA", // Medium Grey from design spec
                            fontSize: "14px",
                          }}
                        >
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                    </Box>
                    {hasPostPermission(post) && (
                      <Box>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPost(post);
                          }}
                          sx={{
                            color: "#2A324B", // Charcoal from design spec
                            "&:hover": {
                              backgroundColor: "#F7F9FC", // Soft Grey from design spec
                            },
                            mx: 1,
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(post._id);
                          }}
                          sx={{
                            color: "#FF3B30", // Error color from design spec
                            "&:hover": {
                              backgroundColor: "#FFF1F0", // Light error color
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        mb: 2,
                        color: "#1A2A56", // Deep Navy from design spec
                        fontWeight: 600,
                        lineHeight: 1.3,
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography
                      component="div"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                      sx={{
                        color: "#495366", // Dark Grey from design spec
                        fontSize: "16px",
                        lineHeight: 1.5,
                      }}
                    />
                  </CardContent>

                  {post.files?.length > 0 && (
                    <Box sx={{ position: "relative" }}>
                      <Carousel
                        showArrows={true}
                        showThumbs={false}
                        infiniteLoop={true}
                        showStatus={false}
                        renderArrowPrev={(onClickHandler, hasPrev) =>
                          hasPrev && (
                            <Button
                              onClick={onClickHandler}
                              sx={{
                                position: "absolute",
                                left: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 2,
                                minWidth: "48px",
                                height: "48px",
                                borderRadius: "24px",
                                bgcolor: "rgba(255, 255, 255, 0.8)",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                                "&:hover": {
                                  bgcolor: "#FFFFFF",
                                },
                              }}
                            >
                              ‹
                            </Button>
                          )
                        }
                        renderArrowNext={(onClickHandler, hasNext) =>
                          hasNext && (
                            <Button
                              onClick={onClickHandler}
                              sx={{
                                position: "absolute",
                                right: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 2,
                                minWidth: "48px",
                                height: "48px",
                                borderRadius: "24px",
                                bgcolor: "rgba(255, 255, 255, 0.8)",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                                "&:hover": {
                                  bgcolor: "#FFFFFF",
                                },
                              }}
                            >
                              ›
                            </Button>
                          )
                        }
                        renderIndicator={(onClickHandler, isSelected, index) => (
                          <Button
                            sx={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "4px",
                              mx: "4px",
                              mb: "16px",
                              p: 0,
                              minWidth: "0",
                              bgcolor: isSelected ? "#0F52BA" : "#E8ECF2",
                              "&:hover": {
                                bgcolor: isSelected ? "#0F52BA" : "#A7B3CA",
                              },
                            }}
                            onClick={onClickHandler}
                            key={index}
                          />
                        )}
                      >
                        {post.files.map((file, index) => (
                          <div key={index}>
                            {file.fileType === "image" ? (
                              <CardMedia
                                component="img"
                                image={`${API_URL2}/${file.filename}`}
                                alt={file.originalName}
                                sx={{
                                  height: 400,
                                  objectFit: "contain",
                                  backgroundColor: "#F7F9FC", // Soft Grey from design spec
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  height: 400,
                                  backgroundColor: "#000000",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <video
                                  controls
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    maxHeight: "400px",
                                  }}
                                >
                                  <source
                                    src={`${API_URL2}/${file.filename}`}
                                    type={file.fileType}
                                  />
                                </video>
                              </Box>
                            )}
                          </div>
                        ))}
                      </Carousel>
                    </Box>
                  )}

                  <CardActions
                    sx={{
                      borderTop: `1px solid #E8ECF2`, // Light Grey from design spec
                      justifyContent: "space-between",
                      p: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReactionMenu(e, post._id);
                        }}
                        sx={{
                          textTransform: "none",
                          color: "#0F52BA", // Primary Blue from design spec
                          fontWeight: 500,
                          borderRadius: "8px",
                          py: 1,
                          px: 2,
                          "&:hover": {
                            backgroundColor: "#E6F0FF", // Light blue background
                          },
                        }}
                        startIcon={<span style={{ fontSize: "18px" }}>👍</span>}
                      >
                        {Object.entries(reactions[post._id] || {}).reduce(
                          (sum, [_, count]) => sum + count,
                          0
                        )}
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/current_post/${post._id}#comments`);
                        }}
                        sx={{
                          textTransform: "none",
                          color: "#495366", // Dark Grey from design spec
                          fontWeight: 500,
                          borderRadius: "8px",
                          py: 1,
                          px: 2,
                          "&:hover": {
                            backgroundColor: "#F7F9FC", // Soft Grey from design spec
                          },
                        }}
                        startIcon={<CommentIcon fontSize="small" />}
                      >
                        {post.comments?.length || 0}
                      </Button>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title="Upvote">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(post._id, 1);
                          }}
                          sx={{
                            color: votes[post._id] > 0 ? "#0F52BA" : "#A7B3CA", // Primary Blue or Medium Grey
                            "&:hover": {
                              backgroundColor: "#E6F0FF", // Light blue background
                            },
                          }}
                        >
                          <ThumbUpIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#495366", // Dark Grey from design spec
                          fontWeight: 500,
                          minWidth: "24px",
                          textAlign: "center",
                        }}
                      >
                        {votes[post._id] || 0}
                      </Typography>
                      <Tooltip title="Downvote">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(post._id, -1);
                          }}
                          sx={{
                            color: votes[post._id] < 0 ? "#FF3B30" : "#A7B3CA", // Error or Medium Grey
                            "&:hover": {
                              backgroundColor: "#FFF1F0", // Light error background
                            },
                          }}
                        >
                          <ThumbDownIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              ))}
        </Grid>
      </Grid>

      {/* Reaction Menu */}
      <Menu
        anchorEl={reactionMenuAnchorEl}
        open={Boolean(reactionMenuAnchorEl)}
        onClose={handleCloseReactionMenu}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "12px",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
            p: 1,
          },
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          {EMOJIS.map((emoji) => (
            <Tooltip key={emoji} title={emoji}>
              <IconButton
                onClick={() => handleReactionToggle(emoji, currentPostId)}
                sx={{
                  fontSize: "24px",
                  width: "48px",
                  height: "48px",
                  borderRadius: "24px",
                  backgroundColor: userReactions[currentPostId]?.[emoji]
                    ? "#E6F0FF" // Light blue background for selected
                    : "transparent",
                  "&:hover": {
                    backgroundColor: "#F7F9FC", // Soft Grey on hover
                  },
                }}
              >
                {emoji}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Menu>

      {/* Create Post FAB */}
      {canCreatePosts() && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            bgcolor: "#0F52BA", // Primary Blue from design spec
            color: "#FFFFFF",
            "&:hover": {
              bgcolor: "#0A3D8F", // 10% darker Primary Blue
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease",
          }}
          onClick={handleOpenEditor}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Post Editor Dialog */}
      <Dialog
        open={openEditor}
        onClose={handleCloseEditor}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.12)",
            height: "80vh",
          },
        }}
      >
        <PostEditor
          post={postToEdit}
          onClose={handleCloseEditor}
          onPostCreated={handlePostCreated}
          boardId={boardId}
          clubId={clubId}
        />
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{
            width: "100%",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Posts;