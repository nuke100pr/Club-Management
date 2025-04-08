"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchUserData } from "@/utils/auth";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  Tooltip,
  Menu,
  Badge,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { colors } from "@/color";

const EMOJIS = ["👍", "❤️", "😂", "🔥", "😢", "👏"];
const API_URL = "http://localhost:5000/api";
const API_URL2 = "http://localhost:5000/uploads";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.post_id;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [reactions, setReactions] = useState({});
  const [votes, setVotes] = useState(0);
  const [userReactions, setUserReactions] = useState({});
  const [reactionMenuAnchorEl, setReactionMenuAnchorEl] = useState(null);

  // Check if user has permission to edit/delete this post
  const hasPostPermission = () => {
    if (!post || !currentUser) return false;
    
    // Admins can edit/delete any post
    if (isAdmin) return true;

    // Users can edit/delete their own posts
    if (post.created_by === userId) return true;

    return false;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userData = await fetchUserData();
        if (userData) {
          setCurrentUser(userData.userData);
          setUserId(userData.userId);
          setIsAdmin(userData.userRole === "super_admin");
        }

        // Fetch post details
        const response = await fetch(`${API_URL}/posts/${postId}`);
        if (!response.ok) throw new Error('Failed to fetch post');
        
        const result = await response.json();
        if (!result) throw new Error('Post not found');
        
        setPost(result);
        
        // Process reactions
        const reactionsObj = {};
        if (Array.isArray(result.reactions)) {
          result.reactions.forEach((reaction) => {
            reactionsObj[reaction.emoji] = (reactionsObj[reaction.emoji] || 0) + 1;
          });
        }
        setReactions(reactionsObj);
        
        // Process votes
        let voteCount = 0;
        if (Array.isArray(result.votes)) {
          result.votes.forEach((vote) => {
            voteCount += vote.vote || 0;
          });
        }
        setVotes(voteCount);
        
        // Process user reactions
        const userReactionsObj = {};
        if (Array.isArray(result.reactions)) {
          result.reactions.forEach((reaction) => {
            if (reaction.user_id === userId) {
              userReactionsObj[reaction.emoji] = true;
            }
          });
        }
        setUserReactions(userReactionsObj);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
        setNotification({
          open: true,
          message: "Failed to load post",
          severity: "error"
        });
      }
    };

    if (postId) {
      fetchData();
    }
  }, [postId]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete post');
      
      router.push('/posts');
      setNotification({
        open: true,
        message: "Post deleted successfully",
        severity: "success"
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      setNotification({
        open: true,
        message: error.message || "Failed to delete post",
        severity: "error"
      });
    }
  };

  const handleEdit = () => {
    router.push(`/edit_post/${postId}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleOpenReactionMenu = (event) => {
    setReactionMenuAnchorEl(event.currentTarget);
  };

  const handleCloseReactionMenu = () => {
    setReactionMenuAnchorEl(null);
  };

  const handleReactionToggle = async (emoji) => {
    try {
      const hasReaction = userReactions[emoji];
      
      if (hasReaction) {
        // Remove reaction
        const response = await fetch(`${API_URL}/api/posts/${postId}/reactions`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            emoji,
          }),
        });

        if (!response.ok) throw new Error('Failed to remove reaction');

        setReactions(prev => ({
          ...prev,
          [emoji]: (prev[emoji] || 0) - 1
        }));

        setUserReactions(prev => ({
          ...prev,
          [emoji]: false
        }));
      } else {
        // Add reaction
        const response = await fetch(`${API_URL}/api/posts/${postId}/reactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            emoji,
          }),
        });

        if (!response.ok) throw new Error('Failed to add reaction');

        setReactions(prev => ({
          ...prev,
          [emoji]: (prev[emoji] || 0) + 1
        }));

        setUserReactions(prev => ({
          ...prev,
          [emoji]: true
        }));
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      setNotification({
        open: true,
        message: "Failed to update reaction",
        severity: "error"
      });
    } finally {
      handleCloseReactionMenu();
    }
  };

  const handleVote = async (voteValue) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          vote: voteValue,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit vote');

      const result = await response.json();
      setVotes(result.newVoteCount || 0);

      setNotification({
        open: true,
        message: voteValue === 1 ? "Upvoted successfully!" : "Downvoted successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
      setNotification({
        open: true,
        message: "Failed to submit vote",
        severity: "error"
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2, ml: 2 }}>Loading post...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/posts')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Posts
        </Button>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Post not found
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/posts')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Posts
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/posts')}
        sx={{ mb: 3 }}
      >
        Back to All Posts
      </Button>

      <Card sx={{ mb: 4, borderRadius: "12px", boxShadow: colors.shadows.card }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={post.user?.avatar || "/default-avatar.jpg"}
                sx={{ border: "2px solid #e0e0e0" }}
              >
                {post.user?.name ? post.user.name.charAt(0) : "U"}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {post.user?.name || "Unknown User"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(post.created_at).toLocaleString()}
                </Typography>
              </Box>
            </Box>
            
            {hasPostPermission() && (
              <Box>
                <IconButton onClick={handleEdit} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={handleDelete} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
            {post.title}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            {post.content}
          </Typography>

          {post.files && post.files.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Attachments
              </Typography>
              <Carousel
                showArrows={true}
                showThumbs={false}
                infiniteLoop={true}
                sx={{ mb: 4 }}
              >
                {post.files.map((file, index) => (
                  <div key={index}>
                    {file.mimetype?.startsWith('image/') ? (
                      <CardMedia
                        component="img"
                        sx={{
                          height: 400,
                          objectFit: "contain",
                          borderRadius: "8px",
                        }}
                        image={`${API_URL2}/${file.filename}`}
                        alt={file.originalname || `Attachment ${index + 1}`}
                      />
                    ) : file.mimetype?.startsWith('video/') ? (
                      <video
                        controls
                        style={{
                          width: "100%",
                          maxHeight: "400px",
                          borderRadius: "8px",
                        }}
                      >
                        <source
                          src={`${API_URL2}/${file.filename}`}
                          type={file.mimetype}
                        />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: colors.background.paper,
                          borderRadius: "8px",
                        }}
                      >
                        <Typography variant="body1">
                          {file.originalname || `File ${index + 1}`}
                        </Typography>
                      </Box>
                    )}
                  </div>
                ))}
              </Carousel>
            </>
          )}

          {/* Reactions and Voting Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderTop: `1px solid ${colors.borders.light}`,
            pt: 2,
            mt: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                onClick={handleOpenReactionMenu}
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  minWidth: "auto",
                  color: colors.text.primary,
                }}
              >
                😊 React
              </Button>

              <Box sx={{ display: "flex", gap: 0.5 }}>
                {Object.entries(reactions)
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
                          color: colors.text.primary,
                          backgroundColor: userReactions[emoji] ? colors.action.selected : 'transparent',
                        }}
                        onClick={() => handleReactionToggle(emoji)}
                      >
                        <span>{emoji}</span>
                        <span style={{ marginLeft: "4px" }}>{count}</span>
                      </Button>
                    </Tooltip>
                  ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => handleVote(1)}
                color="primary"
              >
                <ThumbUpIcon />
              </IconButton>

              <Typography
                variant="body2"
                sx={{ mx: 1, color: colors.text.primary }}
              >
                {votes}
              </Typography>

              <IconButton
                onClick={() => handleVote(-1)}
                color="primary"
              >
                <ThumbDownIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Reaction Menu */}
      <Menu
        anchorEl={reactionMenuAnchorEl}
        open={Boolean(reactionMenuAnchorEl)}
        onClose={handleCloseReactionMenu}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: colors.background.paper,
            boxShadow: colors.shadows.hover,
          },
        }}
      >
        <Box sx={{ display: "flex", padding: "4px" }}>
          {EMOJIS.map((emoji) => (
            <IconButton
              key={emoji}
              onClick={() => handleReactionToggle(emoji)}
              sx={{
                fontSize: "1.5rem",
                backgroundColor: userReactions[emoji]
                  ? colors.action.selected
                  : "transparent",
                "&:hover": {
                  backgroundColor: colors.action.hover,
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
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}