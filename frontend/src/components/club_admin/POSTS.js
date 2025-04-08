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
} from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchUserData } from "@/utils/auth";

const API_URL = "http://localhost:5000/api";
const API_URL2 = "http://localhost:5000/uploads";

const EMOJIS = ["👍", "❤️", "😂", "🔥", "😢", "👏"];

const Posts = ({ clubId }) => {
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
  const [user_id, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);
      }
    }
    loadUserData();
    fetchPosts();
  }, []);

  useEffect(() => {
    // Filter posts whenever posts or clubId changes
    if (clubId) {
      const filtered = posts.filter((post) => post.club_id === clubId);
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [posts, clubId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/posts`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const postsArray = data.posts || [];

      if (Array.isArray(postsArray)) {
        setPosts(postsArray);

        const reactionsObj = {};
        const votesObj = {};
        const userReactionsObj = {};

        postsArray.forEach((post) => {
          // Initialize reactions for this post
          reactionsObj[post._id] = {};

          // Count reactions from the API response
          if (Array.isArray(post.reactions)) {
            post.reactions.forEach((reaction) => {
              reactionsObj[post._id][reaction.emoji] =
                (reactionsObj[post._id][reaction.emoji] || 0) + 1;

              if (reaction.user_id === user_id) {
                userReactionsObj[post._id] = userReactionsObj[post._id] || {};
                userReactionsObj[post._id][reaction.emoji] = true;
              }
            });
          }

          // Calculate votes
          let voteCount = 0;
          if (Array.isArray(post.votes)) {
            post.votes.forEach((vote) => {
              voteCount += vote.vote || 0;
            });
          }
          votesObj[post._id] = voteCount;
        });

        setReactions(reactionsObj);
        setVotes(votesObj);
        setUserReactions(userReactionsObj);
      } else {
        console.error("Unexpected data format:", data);
        setError("Failed to load posts: Unexpected data format");
        setPosts([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
      setLoading(false);
    }
  };

  const handleReactionToggle = async (emoji, postId) => {
    const hasReaction = userReactions[postId]?.[emoji];

    if (hasReaction) {
      await handleRemoveReaction(emoji, postId);
    } else {
      await handleAddReaction(emoji, postId);
    }

    // Update user reactions state
    setUserReactions((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        [emoji]: !hasReaction,
      },
    }));

    handleCloseReactionMenu();
  };

  const handleOpenReactionMenu = (event, postId) => {
    setReactionMenuAnchorEl(event.currentTarget);
    setCurrentPostId(postId);
  };

  const handleCloseReactionMenu = () => {
    setReactionMenuAnchorEl(null);
    setCurrentPostId(null);
  };

  const handleAddReaction = async (emoji) => {
    if (!currentPostId || !user_id) return;

    try {
      const response = await fetch(
        `${API_URL}/api/posts/${currentPostId}/reactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id,
            emoji,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update reactions state
      setReactions((prevReactions) => {
        const postReactions = { ...(prevReactions[currentPostId] || {}) };
        postReactions[emoji] = (postReactions[emoji] || 0) + 1;

        return {
          ...prevReactions,
          [currentPostId]: postReactions,
        };
      });

      setNotification({
        open: true,
        message: `Added ${emoji} reaction!`,
        severity: "success",
      });
    } catch (err) {
      console.error("Error adding reaction:", err);
      setNotification({
        open: true,
        message: "Failed to add reaction. Please try again.",
        severity: "error",
      });
    }
  };

  const handleRemoveReaction = async (emoji, postId) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/reactions`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          emoji,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update reactions state
      setReactions((prevReactions) => {
        const postReactions = { ...(prevReactions[postId] || {}) };
        if (postReactions[emoji] > 0) {
          postReactions[emoji] = postReactions[emoji] - 1;
        }

        return {
          ...prevReactions,
          [postId]: postReactions,
        };
      });
    } catch (err) {
      console.error("Error removing reaction:", err);
      setNotification({
        open: true,
        message: "Failed to remove reaction. Please try again.",
        severity: "error",
      });
    }
  };

  const handleUpvote = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          vote: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setVotes((prevVotes) => ({
        ...prevVotes,
        [id]: (prevVotes[id] || 0) + 1,
      }));

      setNotification({
        open: true,
        message: "Upvoted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error upvoting:", err);
      setNotification({
        open: true,
        message: "Failed to upvote. Please try again.",
        severity: "error",
      });
    }
  };

  const handleDownvote = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          vote: -1,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setVotes((prevVotes) => ({
        ...prevVotes,
        [id]: (prevVotes[id] || 0) - 1,
      }));

      setNotification({
        open: true,
        message: "Downvoted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error downvoting:", err);
      setNotification({
        open: true,
        message: "Failed to downvote. Please try again.",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setPosts(posts.filter((post) => post._id !== id));

      setNotification({
        open: true,
        message: "Post deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting post:", err);
      setNotification({
        open: true,
        message: "Failed to delete post. Please try again.",
        severity: "error",
      });
    }
  };

  const handleEdit = (postId) => {
    setIsNavigating(true);
    router.push(`/edit_post/${postId}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (isNavigating) {
    return (
      <LinearProgress
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
      />
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          textAlign: "center",
          my: 4,
          p: 2,
          bgcolor: "background.paper",
          borderRadius: "12px",
        }}
      >
        <Typography color="error">{error}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={fetchPosts}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          my: 4,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: "12px",
        }}
      >
        <Typography variant="h6">
          {clubId ? "No posts available in this board" : "No posts available"}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {clubId
            ? "Be the first to create a post in this board!"
            : "Be the first to create a post!"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {filteredPosts.map((post) => (
        <Card
          key={post._id}
          sx={{
            mb: 3,
            borderRadius: "12px",
            boxShadow: 3,
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: 6,
            },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 2,
              borderBottom: "1px solid rgba(0,0,0,0.12)",
            }}
          >
            <CardHeader
              avatar={
                <Avatar
                  src={post.user?.avatar || "/default-avatar.jpg"}
                  sx={{ border: "2px solid #e0e0e0" }}
                >
                  {post.user?.name ? post.user.name.charAt(0) : "U"}
                </Avatar>
              }
              title={post.user?.name || "Anonymous"}
              subheader={new Date(
                post.createdAt || Date.now()
              ).toLocaleString()}
              sx={{ padding: 0 }}
            />

            {(isSuperAdmin || (user_id && user_id === post.user?._id)) && (
              <Box>
                <IconButton
                  onClick={() => handleEdit(post._id)}
                  color="primary"
                  disabled={isNavigating}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(post._id)}
                  color="error"
                  disabled={isNavigating}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <CardContent>
            <Typography variant="h5" component="h2">
              {post.title}
            </Typography>
          </CardContent>

          <CardContent>
            <Typography
              component="div"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>

          {post.files && post.files.length > 0 && (
            <Carousel showArrows={true} showThumbs={false} infiniteLoop={true}>
              {post.files.map((file, index) => (
                <div
                  key={index}
                  style={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  {file.fileType === "image" ? (
                    <CardMedia
                      component="img"
                      height="300"
                      width="500"
                      image={`${API_URL2}/${file.filename}`}
                      alt={file.originalName}
                      sx={{
                        objectFit: "contain",
                        width: "100%",
                        height: "300px",
                      }}
                    />
                  ) : file.fileType === "video" ? (
                    <video
                      width="100%"
                      height="100%"
                      controls
                      src={`${API_URL2}/${file.filename}`}
                      style={{ objectFit: "cover" }}
                    />
                  ) : null}
                </div>
              ))}
            </Carousel>
          )}

          <CardActions
            sx={{
              borderTop: "1px solid rgba(0,0,0,0.12)",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Button
                onClick={(e) => handleOpenReactionMenu(e, post._id)}
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  minWidth: "auto",
                }}
                disabled={isNavigating}
              >
                😊 React
              </Button>

              <Box sx={{ display: "flex", gap: 0.5 }}>
                {reactions[post._id] &&
                  Object.entries(reactions[post._id])
                    .filter(([emoji, count]) => count > 0)
                    .map(([emoji, count]) => (
                      <Tooltip key={emoji} title={`${count} ${emoji}`}>
                        <Button
                          size="small"
                          sx={{
                            minWidth: "auto",
                            padding: "0 8px",
                            borderRadius: "16px",
                            fontSize: "0.875rem",
                          }}
                        >
                          <span>{emoji}</span>
                          <span style={{ marginLeft: "4px" }}>{count}</span>
                        </Button>
                      </Tooltip>
                    ))}
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={() => handleUpvote(post._id)}
                color="primary"
                disabled={isNavigating}
              >
                <ThumbUpIcon />
              </IconButton>

              <Typography variant="body2" sx={{ mx: 1 }}>
                {votes[post._id] || 0}
              </Typography>

              <IconButton
                onClick={() => handleDownvote(post._id)}
                color="primary"
                disabled={isNavigating}
              >
                <ThumbDownIcon />
              </IconButton>
            </Box>
          </CardActions>
        </Card>
      ))}

      <Menu
        anchorEl={reactionMenuAnchorEl}
        open={Boolean(reactionMenuAnchorEl)}
        onClose={handleCloseReactionMenu}
      >
        <Box sx={{ display: "flex", padding: "4px" }}>
          {EMOJIS.map((emoji) => (
            <IconButton
              key={emoji}
              onClick={() => handleReactionToggle(emoji, currentPostId)}
              sx={{
                fontSize: "1.5rem",
                backgroundColor: userReactions[currentPostId]?.[emoji]
                  ? "rgba(25, 118, 210, 0.12)"
                  : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
      </Menu>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Posts;
