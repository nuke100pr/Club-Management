"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  IconButton,
  Typography,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  Button,
  Skeleton,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  ThumbUp,
  ThumbDown,
  Comment as CommentIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { fetchUserData } from "@/utils/auth";

const API_URL = "http://localhost:5000/api";
const API_URL2 = "http://localhost:5000/uploads";
const EMOJIS = ["👍", "❤️", "😂", "🔥", "😢", "👏"];

const Posts = ({ searchQuery = "" }) => {
  const router = useRouter();
  const theme = useTheme();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [reactions, setReactions] = useState({});
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReactions, setUserReactions] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [reactionMenuAnchorEl, setReactionMenuAnchorEl] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [skeletonLoading, setSkeletonLoading] = useState(true);

  // Define theme-specific colors
  const cardBgColor =
    theme.palette.mode === "dark" ? theme.palette.background.paper : "#fff";
  const cardBorderColor =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.divider, 0.2)
      : "rgba(0, 0, 0, 0.05)";
  const cardShadow =
    theme.palette.mode === "dark"
      ? "0 4px 8px rgba(0, 0, 0, 0.25)"
      : "0 4px 8px rgba(95, 150, 230, 0.1)";
  const textPrimaryColor = theme.palette.text.primary;
  const textSecondaryColor = theme.palette.text.secondary;
  const gradientText = {
    background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    MozBackgroundClip: "text",
    MozTextFillColor: "transparent",
  };

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserId(result.userId);
      }
    }
    loadUserData();
    fetchPosts();

    // Add global style to hide scrollbars
    const style = document.createElement("style");
    style.textContent = `
      * {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;     /* Firefox */
      }
      *::-webkit-scrollbar {
        display: none;             /* Chrome, Safari and Opera */
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    let filtered = [...posts];

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter((post) => {
        return (
          post.content?.toLowerCase().includes(term) ||
          post.title?.toLowerCase().includes(term) ||
          post.user?.name?.toLowerCase().includes(term)
        );
      });
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setSkeletonLoading(true);

      // Set minimum loading time of 500ms
      const minLoadTime = new Promise((resolve) => setTimeout(resolve, 500));

      const url = `${API_URL}/posts`;
      const fetchPromise = fetch(url)
        .then((response) => {
          if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          const postsArray = data.posts || [];
          if (Array.isArray(postsArray)) {
            setPosts(postsArray);
            initializeReactionsAndVotes(postsArray);
          } else {
            throw new Error("Unexpected data format");
          }
        });

      // Wait for both the minimum time and the fetch to complete
      await Promise.all([minLoadTime, fetchPromise]);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setSkeletonLoading(false);
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

  const handleReactionToggle = async (emoji, postId) => {
    const hasReaction = userReactions[postId]?.[emoji];

    try {
      const url = `${API_URL}/api/posts/${postId}/reactions`;
      const method = hasReaction ? "DELETE" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, emoji }),
      });

      if (!response.ok)
        throw new Error(`Failed to ${hasReaction ? "remove" : "add"} reaction`);

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
        [postId]: { ...prev[postId], [emoji]: !hasReaction },
      }));

      showNotification(
        hasReaction ? `Removed ${emoji} reaction` : `Added ${emoji} reaction`,
        "success"
      );
    } catch (err) {
      console.error("Error toggling reaction:", err);
      showNotification("Failed to update reaction", "error");
      fetchPosts();
    }
    handleCloseReactionMenu();
  };

  const handleVote = async (postId, voteValue) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, vote: voteValue }),
      });

      if (!response.ok) throw new Error("Failed to submit vote");

      const result = await response.json();
      setVotes((prev) => ({ ...prev, [postId]: result.data.netVotes || 0 }));

      showNotification(
        voteValue === 1 ? "Upvoted successfully!" : "Downvoted successfully!",
        "success"
      );
    } catch (error) {
      console.error("Error submitting vote:", error);
      showNotification("Failed to submit vote", "error");
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleOpenReactionMenu = (event, postId) => {
    event.stopPropagation();
    setReactionMenuAnchorEl(event.currentTarget);
    setCurrentPostId(postId);
  };

  const handleCloseReactionMenu = () => {
    setReactionMenuAnchorEl(null);
    setCurrentPostId(null);
  };

  const navigateToPost = (postId) => {
    router.push(`/current_post/${postId}`);
  };

  // Skeleton loading components with theme support
  const SkeletonPostCard = () => (
    <Card
      sx={{
        marginBottom: "24px",
        borderRadius: "12px",
        boxShadow: cardShadow,
        maxWidth: "700px",
        backgroundColor: cardBgColor,
      }}
    >
      <CardHeader
        avatar={<Skeleton variant="circular" width={40} height={40} />}
        title={<Skeleton variant="text" width="60%" height={24} />}
        subheader={<Skeleton variant="text" width="40%" height={20} />}
      />
      <CardContent>
        <Skeleton
          variant="text"
          width="90%"
          height={28}
          sx={{ marginBottom: "12px" }}
        />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", padding: "16px" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Skeleton
            variant="circular"
            width={32}
            height={32}
            sx={{ marginRight: "16px" }}
          />
          <Skeleton
            variant="circular"
            width={32}
            height={32}
            sx={{ marginRight: "16px" }}
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={32}
            sx={{ borderRadius: "16px" }}
          />
        </Box>
        <Skeleton variant="circular" width={32} height={32} />
      </CardActions>
    </Card>
  );

  // Loading state with skeleton
  if (skeletonLoading)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          padding: "24px",
          maxWidth: "700px",
          margin: "0 auto",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {[1, 2, 3].map((item) => (
          <SkeletonPostCard key={item} />
        ))}
      </Box>
    );

  // Error state with modern styling and theme support
  if (error)
    return (
      <Box
        sx={{
          textAlign: "center",
          padding: "48px",
          borderRadius: "16px",
          boxShadow: cardShadow,
          maxWidth: "600px",
          margin: "64px auto 0",
          backgroundColor: cardBgColor,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: theme.palette.error.main,
            marginBottom: "24px",
            fontWeight: 600,
          }}
        >
          Something went wrong
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: textSecondaryColor, marginBottom: "32px" }}
        >
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={fetchPosts}
          sx={{
            padding: "8px 32px",
            background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 500,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
              transform: "translateY(-2px)",
            },
          }}
        >
          Try Again
        </Button>
      </Box>
    );

  // Empty state with modern styling and theme support
  const renderEmptyState = () => (
    <Box
      sx={{
        textAlign: "center",
        padding: "48px",
        borderRadius: "16px",
        boxShadow: cardShadow,
        maxWidth: "700px",
        margin: "48px auto 0",
        backgroundColor: cardBgColor,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          marginBottom: "24px",
          fontWeight: 600,
          ...gradientText,
        }}
      >
        {searchQuery ? "No posts match your search" : "No posts available"}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: "24px",
        position: "relative",
      }}
    >
      {filteredPosts.length === 0 ? (
        renderEmptyState()
      ) : (
        <Box sx={{ maxWidth: "700px", margin: "0 auto" }}>
          {filteredPosts.map((post) => (
            <Card
              key={post._id}
              sx={{
                marginBottom: "24px",
                overflow: "hidden",
                borderRadius: "12px",
                boxShadow: cardShadow,
                backgroundColor: cardBgColor,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 8px 16px rgba(0, 0, 0, 0.3)"
                      : "0 8px 16px rgba(95, 150, 230, 0.2)",
                  transform: "translateY(-4px)",
                },
              }}
              onClick={() => navigateToPost(post._id)}
            >
              <CardHeader
                avatar={
                  <Avatar
                    src={`http://localhost:5000/uploads/${
                      post.board?.image?.filename || post.club?.image?.filename
                    }`}
                    sx={{
                      width: "40px",
                      height: "40px",
                      border: `1px solid ${theme.palette.background.paper}`,
                    }}
                  >
                    {post.board?.name?.[0] || post.club?.name?.[0] || "A"}
                  </Avatar>
                }
                title={
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: textPrimaryColor }}
                  >
                    {post.board?.name || post.club?.name || "Anonymous"}
                  </Typography>
                }
                subheader={
                  <Typography
                    variant="caption"
                    sx={{ color: textSecondaryColor }}
                  >
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                }
                sx={{
                  borderBottom: `1px solid ${cardBorderColor}`,
                  padding: "12px 16px",
                }}
              />

              <CardContent
                sx={{
                  padding: "16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.action.hover, 0.05),
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    marginBottom: "12px",
                    fontWeight: 600,
                    ...gradientText,
                  }}
                >
                  {post.title}
                </Typography>
                <Typography
                  component="div"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  sx={{
                    maxHeight: "80px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    color: textPrimaryColor,
                    marginBottom: "12px",
                  }}
                />
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToPost(post._id);
                  }}
                  sx={{
                    marginTop: "8px",
                    fontWeight: 500,
                    color: "#4776E6",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 16px",
                    fontSize: "0.8rem",
                    "&:hover": {
                      backgroundColor: alpha("#4776E6", 0.05),
                    },
                  }}
                >
                  Read more
                </Button>
              </CardContent>

              {post.files?.length > 0 && (
                <Box
                  sx={{
                    borderTop: `1px solid ${cardBorderColor}`,
                    borderBottom: `1px solid ${cardBorderColor}`,
                  }}
                >
                  <Carousel
                    showArrows={true}
                    showThumbs={false}
                    infiniteLoop={true}
                    showStatus={false}
                    swipeable={true}
                    emulateTouch={true}
                  >
                    {post.files.map((file, index) => (
                      <Box key={index} sx={{ height: "250px" }}>
                        <CardMedia
                          component="img"
                          alt={`Post image ${index + 1}`}
                          src={`${API_URL2}/${file.filename}`}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                    ))}
                  </Carousel>
                </Box>
              )}

              <CardActions
                sx={{
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderTop:
                    post.files?.length === 0
                      ? `1px solid ${cardBorderColor}`
                      : "none",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Tooltip title="Like">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(post._id, 1);
                      }}
                      sx={{
                        color:
                          votes[post._id] > 0 ? "#4776E6" : textSecondaryColor,
                        padding: "8px",
                      }}
                    >
                      <ThumbUp fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      margin: "0 4px",
                      color:
                        votes[post._id] > 0
                          ? "#4776E6"
                          : votes[post._id] < 0
                          ? theme.palette.error.main
                          : textSecondaryColor,
                    }}
                  >
                    {votes[post._id]}
                  </Typography>
                  <Tooltip title="Dislike">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(post._id, -1);
                      }}
                      sx={{
                        color:
                          votes[post._id] < 0
                            ? theme.palette.error.main
                            : textSecondaryColor,
                        padding: "8px",
                      }}
                    >
                      <ThumbDown fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Button
                    startIcon={<CommentIcon fontSize="small" />}
                    onClick={(e) => handleOpenReactionMenu(e, post._id)}
                    sx={{
                      marginLeft: "8px",
                      borderRadius: "16px",
                      padding: "4px 12px",
                      color: "#4776E6",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      "&:hover": {
                        backgroundColor: alpha("#4776E6", 0.05),
                      },
                    }}
                  >
                    React
                  </Button>
                </Box>

                <Tooltip title="Share">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        typeof window !== "undefined" &&
                        typeof navigator !== "undefined"
                      ) {
                        navigator.clipboard
                          .writeText(
                            `${window.location.origin}/post/${post._id}`
                          )
                          .then(() => {
                            showNotification(
                              "Link copied to clipboard",
                              "success"
                            );
                          })
                          .catch((err) => {
                            console.error("Failed to copy link:", err);
                            showNotification("Failed to copy link", "error");
                          });
                      }
                    }}
                    sx={{
                      color: "#8E54E9",
                      padding: "8px",
                    }}
                  >
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CardActions>

              {Object.keys(reactions[post._id] || {}).length > 0 && (
                <Box
                  sx={{
                    padding: "0 16px 12px 16px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  {Object.entries(reactions[post._id] || {}).map(
                    ([emoji, count]) =>
                      count > 0 && (
                        <Tooltip
                          key={emoji}
                          title={`${count} ${emoji}`}
                          placement="top"
                        >
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReactionToggle(emoji, post._id);
                            }}
                            sx={{
                              borderRadius: "12px",
                              minWidth: "auto",
                              padding: "2px 12px",
                              fontSize: "0.75rem",
                              backgroundColor: userReactions[post._id]?.[emoji]
                                ? alpha("#4776E6", 0.2)
                                : alpha(theme.palette.action.hover, 0.1),
                              color: userReactions[post._id]?.[emoji]
                                ? "#4776E6"
                                : textPrimaryColor,
                              border: userReactions[post._id]?.[emoji]
                                ? "1px solid #4776E6"
                                : `1px solid ${alpha(
                                    theme.palette.divider,
                                    0.2
                                  )}`,
                            }}
                          >
                            {emoji} {count}
                          </Button>
                        </Tooltip>
                      )
                  )}
                </Box>
              )}
            </Card>
          ))}
        </Box>
      )}

      <Menu
        anchorEl={reactionMenuAnchorEl}
        open={Boolean(reactionMenuAnchorEl)}
        onClose={handleCloseReactionMenu}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
            backgroundColor: cardBgColor,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            padding: "12px",
            width: "250px",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {EMOJIS.map((emoji) => (
            <IconButton
              key={emoji}
              onClick={() => handleReactionToggle(emoji, currentPostId)}
              sx={{
                fontSize: "20px",
                backgroundColor: userReactions[currentPostId]?.[emoji]
                  ? alpha("#4776E6", 0.1)
                  : "transparent",
                border: userReactions[currentPostId]?.[emoji]
                  ? "2px solid #4776E6"
                  : `1px solid ${cardBorderColor}`,
                borderRadius: "6px",
                padding: "8px",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: alpha("#4776E6", 0.05),
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
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            borderRadius: "6px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
            backgroundColor:
              notification.severity === "error"
                ? theme.palette.error.main
                : notification.severity === "success"
                ? theme.palette.success.main
                : theme.palette.primary.main,
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Posts;
