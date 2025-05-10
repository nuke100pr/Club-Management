"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  Tooltip,
  Dialog,
  Skeleton,
} from "@mui/material";
import {
  ThumbUp,
  ThumbDown,
  Comment as CommentIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { fetchUserData, getAuthToken } from "@/utils/auth";
import PostEditor from "../../../components/posts/PostEditor";

const API_URL = "http://localhost:5000/api";
const API_URL2 = "http://localhost:5000/uploads";
const EMOJIS = ["👍", "❤️", "😂", "🔥", "😢", "👏"];

const SinglePostPage = () => {
  const params = useParams();
  const router = useRouter();
  const postId = params.post_id;

  const [post, setPost] = useState(null);
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
  const [userId, setUserId] = useState(null);
  const [openEditor, setOpenEditor] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function loadUserData() {
      const token = await getAuthToken();
      setAuthToken(token);
      
      const result = await fetchUserData();
      if (result) {
        setUserId(result.userId);
      }
    }
    loadUserData();
    fetchPost();
  }, [postId]);

  useEffect(() => {
    if(reactions)
    {
      console.log(reactions);
    }
  }, [reactions]);

  const fetchPost = async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      setSkeletonLoading(true);

      // Set minimum loading time of 500ms
      const minLoadTime = new Promise((resolve) => setTimeout(resolve, 500));

      const url = `${API_URL}/posts/${postId}`;
      const fetchPromise = fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      })
        .then((response) => {
          if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          // Handle both possible response formats
          const postData = data.post || data;
          if (postData) {
            setPost(postData);
            console.log(postData);
            
            initializeReactionsAndVotes(postData);
          } else {
            throw new Error("Post not found");
          }
        });

      // Wait for both the minimum time and the fetch to complete
      await Promise.all([minLoadTime, fetchPromise]);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setSkeletonLoading(false);
    }
  };

  const initializeReactionsAndVotes = (postData) => {
    const reactionsObj = {};
    const userReactionsObj = {};

    reactionsObj[postData._id] = {};
    userReactionsObj[postData._id] = {};

    console.log(postData);
    if (Array.isArray(postData.reactions)) {
      postData.reactions.forEach((reaction) => {
        reactionsObj[postData._id][reaction.emoji] =
          (reactionsObj[postData._id][reaction.emoji] || 0) + 1;

        
        if (reaction.user_id === userId) {
          userReactionsObj[postData._id][reaction.emoji] = true;
        }
      });
    }

    const netVotes =
      postData.votes?.reduce((sum, vote) => sum + (vote.vote || 0), 0) || 0;

    setReactions(reactionsObj);
    setVotes({ [postData._id]: netVotes });
    setUserReactions(userReactionsObj);
  };

  const handleOpenEditor = () => {
    setPostToEdit(post);
    setOpenEditor(true);
  };

  const handleCloseEditor = () => {
    setOpenEditor(false);
    setPostToEdit(null);
  };

  const handlePostUpdated = (updatedPost) => {
    setPost(updatedPost);
    handleCloseEditor();
    showNotification("Post updated successfully", "success");
  };

  const handleReactionToggle = async (emoji, postId) => {
    if (!authToken) return;
    
    const currentReaction = Object.keys(userReactions[postId] || {}).find(
      (key) => userReactions[postId][key]
    ); // Find the user's current reaction
    const hasReaction = currentReaction === emoji; // Check if the clicked emoji is the current reaction
  
    try {
      const url = `${API_URL}/api/posts/${postId}/reactions`;
      const method = hasReaction ? "DELETE" : "POST";
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
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
        hasReaction
          ? `Removed ${emoji} reaction`
          : `Added ${emoji} reaction`
          , "success"
      );
    } catch (err) {
      console.error("Error toggling reaction:", err);
      showNotification("Failed to update reaction", "error");
      fetchPost(); // Re-fetch to restore state on error
    }
    handleCloseReactionMenu();
  };

  const handleVote = async (postId, voteValue) => {
    if (!authToken) return;

    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/votes`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
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

  const handleDelete = async (postId) => {
    if (!authToken) return;

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error("Delete failed");

      showNotification("Post deleted successfully", "success");
      
      // Navigate back after successful deletion
      setTimeout(() => {
        router.push("/");
      }, 1500);
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

  const handleOpenReactionMenu = (event) => {
    event.stopPropagation();
    setReactionMenuAnchorEl(event.currentTarget);
  };

  const handleCloseReactionMenu = () => {
    setReactionMenuAnchorEl(null);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/current_post/${postId}`);
    showNotification("Link copied to clipboard", "success");
  };

  // Skeleton loading component
  const SkeletonPostCard = () => (
    <Card
      style={{
        marginBottom: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(95, 150, 230, 0.1)",
        maxWidth: "800px",
        margin: "0 auto",
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
          height={32}
          style={{ marginBottom: "16px" }}
        />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="90%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
      </CardContent>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={300}
        style={{ marginBottom: "16px" }}
      />
      <CardActions style={{ justifyContent: "space-between", padding: "16px" }}>
        <Box style={{ display: "flex", alignItems: "center" }}>
          <Skeleton
            variant="circular"
            width={32}
            height={32}
            style={{ marginRight: "16px" }}
          />
          <Skeleton
            variant="circular"
            width={32}
            height={32}
            style={{ marginRight: "16px" }}
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={32}
            style={{ borderRadius: "16px" }}
          />
        </Box>
        <Skeleton variant="circular" width={32} height={32} />
      </CardActions>
    </Card>
  );

  // Loading state with skeleton
  if (skeletonLoading) {
    return (
      <Box
        style={{
          padding: "24px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <SkeletonPostCard />
      </Box>
    );
  }

  // Error state with modern styling
  if (error) {
    return (
      <Box
        style={{
          textAlign: "center",
          padding: "48px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
          maxWidth: "600px",
          margin: "64px auto",
        }}
      >
        <Typography
          variant="h5"
          style={{ color: "#EF4444", marginBottom: "24px", fontWeight: 600 }}
        >
          Something went wrong
        </Typography>
        <Typography
          variant="body1"
          style={{ color: "#607080", marginBottom: "32px" }}
        >
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push("/")}
          style={{
            marginRight: "16px",
            padding: "8px 32px",
            background: "#607080",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Go back
        </Button>
        <Button
          variant="contained"
          onClick={fetchPost}
          style={{
            padding: "8px 32px",
            background: "linear-gradient(90deg, #4776E6, #8E54E9)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 500,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
          }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  // If no post found
  if (!post) {
    return (
      <Box
        style={{
          textAlign: "center",
          padding: "48px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
          maxWidth: "600px",
          margin: "64px auto",
        }}
      >
        <Typography
          variant="h5"
          style={{
            marginBottom: "24px",
            fontWeight: 600,
            background: "linear-gradient(90deg, #4776E6, #8E54E9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Post not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push("/")}
          style={{
            padding: "8px 32px",
            background: "linear-gradient(90deg, #4776E6, #8E54E9)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 500,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
          }}
        >
          Go back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box
      style={{
        padding: "24px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <Button
        onClick={() => router.back()}
        style={{
          marginBottom: "24px",
          color: "#4776E6",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        ← Back
      </Button>

      <Card
        style={{
          overflow: "hidden",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              src={`http://localhost:5000/uploads/${
                post.board?.image?.filename || post.club?.image?.filename
              }`}
              style={{
                width: "40px",
                height: "40px",
                border: "1px solid white",
              }}
            >
              {post.board?.name?.[0] || post.club?.name?.[0] || "A"}
            </Avatar>
          }
          action={
            <Box>
              <Tooltip title="Edit">
                <IconButton
                  onClick={handleOpenEditor}
                  style={{
                    color: "#4776E6",
                    marginRight: "4px",
                    padding: "8px",
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  onClick={() => handleDelete(post._id)}
                  style={{
                    color: "#EF4444",
                    padding: "8px",
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
          title={
            <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
              {post.board?.name || post.club?.name || "Anonymous"}
            </Typography>
          }
          subheader={
            <Typography variant="caption" style={{ color: "#607080" }}>
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          }
          style={{
            borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
            padding: "16px",
          }}
        />

        <CardContent
          style={{
            padding: "24px 16px",
          }}
        >
          <Typography
            variant="h5"
            style={{
              marginBottom: "16px",
              fontWeight: 600,
              color: "#2A3B4F",
            }}
          >
            {post.title}
          </Typography>

          <Typography
            component="div"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              color: "#2A3B4F",
              lineHeight: 1.6,
              fontSize: "1.05rem",
            }}
          />
        </CardContent>

        {post.files?.length > 0 && (
          <Box
            style={{
              borderTop: "1px solid rgba(0, 0, 0, 0.05)",
              borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
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
                <Box key={index} style={{ height: "400px" }}>
                  <CardMedia
                    component="img"
                    alt={`Post image ${index + 1}`}
                    src={`${API_URL2}/${file.filename}`}
                    style={{
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
          style={{
            justifyContent: "space-between",
            padding: "16px",
          }}
        >
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Like">
              <IconButton
                onClick={() => handleVote(post._id, 1)}
                style={{
                  color: votes[post._id] > 0 ? "#4776E6" : "#607080",
                  padding: "8px",
                }}
              >
                <ThumbUp fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography
              variant="body2"
              style={{
                fontWeight: 600,
                margin: "0 4px",
                color:
                  votes[post._id] > 0
                    ? "#4776E6"
                    : votes[post._id] < 0
                    ? "#EF4444"
                    : "#607080",
              }}
            >
              {votes[post._id]}
            </Typography>
            <Tooltip title="Dislike">
              <IconButton
                onClick={() => handleVote(post._id, -1)}
                style={{
                  color: votes[post._id] < 0 ? "#EF4444" : "#607080",
                  padding: "8px",
                }}
              >
                <ThumbDown fontSize="small" />
              </IconButton>
            </Tooltip>

            <Button
              startIcon={<CommentIcon fontSize="small" />}
              onClick={handleOpenReactionMenu}
              style={{
                marginLeft: "8px",
                borderRadius: "16px",
                padding: "4px 12px",
                color: "#4776E6",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              React
            </Button>
          </Box>

          <Tooltip title="Share">
            <IconButton
              onClick={handleShare}
              style={{
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
            style={{
              padding: "0 16px 16px 16px",
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
                      onClick={() => handleReactionToggle(emoji, post._id)}
                      style={{
                        borderRadius: "12px",
                        minWidth: "auto",
                        padding: "2px 12px",
                        fontSize: "0.75rem",
                        backgroundColor: userReactions[post._id]?.[emoji]
                          ? "rgba(71, 118, 230, 0.2)"
                          : "rgba(95, 150, 230, 0.1)",
                        color: userReactions[post._id]?.[emoji]
                          ? "#4776E6"
                          : "#2A3B4F",
                        border: userReactions[post._id]?.[emoji]
                          ? "1px solid #4776E6"
                          : "1px solid rgba(95, 150, 230, 0.2)",
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

      <Menu
        anchorEl={reactionMenuAnchorEl}
        open={Boolean(reactionMenuAnchorEl)}
        onClose={handleCloseReactionMenu}
        PaperProps={{
          style: {
            borderRadius: "8px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <Box
          style={{
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
              onClick={() => handleReactionToggle(emoji, post._id)}
              style={{
                fontSize: "20px",
                backgroundColor: userReactions[post._id]?.[emoji]
                  ? "rgba(71, 118, 230, 0.1)"
                  : "transparent",
                border: userReactions[post._id]?.[emoji]
                  ? "2px solid #4776E6"
                  : "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: "6px",
                padding: "8px",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: "rgba(71, 118, 230, 0.05)",
                },
              }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
      </Menu>

      {openEditor && (
        <PostEditor
          boardId={post.board_id}
          clubId={post.club_id}
          onPostCreated={handlePostUpdated}
          onClose={handleCloseEditor}
          postToEdit={postToEdit}
        />
      )}

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
          style={{
            borderRadius: "6px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
            backgroundColor:
              notification.severity === "error"
                ? "#EF4444"
                : notification.severity === "success"
                ? "#388E3C"
                : "#1976d2",
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SinglePostPage;
