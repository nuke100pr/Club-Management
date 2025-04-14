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

// Modern UI Design System
const theme = {
  colors: {
    primary: {
      main: "#4776E6",
      light: "#6a98ff",
      dark: "#3a5fc0",
      gradient: "linear-gradient(45deg, #4776E6 0%, #8E54E9 100%)",
    },
    secondary: "#8E54E9",
    background: {
      default: "#f8faff",
      card: "#ffffff",
      sidebar: "rgba(245, 247, 250, 0.7)",
    },
    text: {
      primary: "#2A3B4F",
      secondary: "#607080",
    },
    accent: {
      blue: "#1976d2",
      green: "#388e3c",
      red: "#d32f2f",
      purple: "#7b1fa2",
    },
    borders: {
      light: "rgba(95, 150, 230, 0.15)",
    },
    action: {
      selected: "rgba(95, 150, 230, 0.2)",
      hover: "rgba(95, 150, 230, 0.1)",
    },
  },
  shadows: {
    card: "0 4px 12px rgba(95, 150, 230, 0.1)",
    cardHover: "0 12px 20px rgba(95, 150, 230, 0.2)",
    button: "0 4px 10px rgba(71, 118, 230, 0.3)",
    buttonHover: "0 6px 15px rgba(71, 118, 230, 0.4)",
    input: "0 2px 8px rgba(95, 150, 230, 0.1)",
    inputFocus: "0 4px 15px rgba(95, 150, 230, 0.2)",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
    cardBorderRadius: 16,
    buttonBorderRadius: 8,
  },
  spacing: {
    cardPadding: 24,
    pagePadding: 32,
  },
};

const EMOJIS = ["👍", "❤️", "😂", "🔥", "😢", "👏"];
const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;
const API_URL2 = `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads`;

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
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        mt: 8,
        height: '50vh'
      }}>
        <CircularProgress 
          size={60}
          sx={{ 
            color: theme.colors.primary.main
          }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            mt: 3, 
            fontFamily: theme.typography.fontFamily,
            color: theme.colors.text.primary,
            fontWeight: 500 
          }}
        >
          Loading post...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        bgcolor: theme.colors.background.default,
        minHeight: '100vh'
      }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            width: '100%', 
            maxWidth: 700,
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows.card
          }}
        >
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/posts')}
          startIcon={<ArrowBackIcon />}
          sx={{
            background: theme.colors.primary.gradient,
            color: 'white',
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: theme.shape.buttonBorderRadius,
            boxShadow: theme.shadows.button,
            padding: '10px 24px',
            '&:hover': {
              boxShadow: theme.shadows.buttonHover,
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Back to Posts
        </Button>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        bgcolor: theme.colors.background.default,
        minHeight: '100vh'
      }}>
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3, 
            width: '100%', 
            maxWidth: 700,
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows.card
          }}
        >
          Post not found
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/posts')}
          startIcon={<ArrowBackIcon />}
          sx={{
            background: theme.colors.primary.gradient,
            color: 'white',
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: theme.shape.buttonBorderRadius,
            boxShadow: theme.shadows.button,
            padding: '10px 24px',
            '&:hover': {
              boxShadow: theme.shadows.buttonHover,
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Back to Posts
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 4, 
      bgcolor: theme.colors.background.default,
      minHeight: '100vh',
      fontFamily: theme.typography.fontFamily
    }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/posts')}
        sx={{ 
          mb: 4,
          color: theme.colors.text.primary,
          fontWeight: 500,
          textTransform: 'none',
          borderRadius: theme.shape.buttonBorderRadius,
          '&:hover': {
            backgroundColor: 'rgba(71, 118, 230, 0.08)',
          },
          transition: 'all 0.3s ease'
        }}
      >
        Back to All Posts
      </Button>

      <Card 
        sx={{ 
          mb: 4, 
          borderRadius: theme.shape.cardBorderRadius, 
          boxShadow: theme.shadows.card,
          maxWidth: 900,
          margin: '0 auto',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          borderTop: `4px solid ${theme.colors.primary.main}`,
          '&:hover': {
            boxShadow: theme.shadows.cardHover,
            transform: 'translateY(-8px)',
          }
        }}
      >
        <CardContent sx={{ padding: 3 }}>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mb: 3 
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={post.user?.avatar || "/default-avatar.jpg"}
                sx={{ 
                  width: 50, 
                  height: 50,
                  border: `2px solid ${theme.colors.borders.light}`
                }}
              >
                {post.user?.name ? post.user.name.charAt(0) : "U"}
              </Avatar>
              <Box>
                <Typography 
                  variant="subtitle1" 
                  sx={{
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    fontSize: '1rem'
                  }}
                >
                  {post.user?.name || "Unknown User"}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: theme.colors.text.secondary,
                    fontSize: '0.825rem'
                  }}
                >
                  {new Date(post.created_at).toLocaleString()}
                </Typography>
              </Box>
            </Box>
            
            {hasPostPermission() && (
              <Box>
                <Tooltip title="Edit Post">
                  <IconButton 
                    onClick={handleEdit} 
                    sx={{
                      color: theme.colors.primary.main,
                      '&:hover': {
                        backgroundColor: theme.colors.action.hover,
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Post">
                  <IconButton 
                    onClick={handleDelete} 
                    sx={{
                      color: theme.colors.accent.red,
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          <Typography 
            variant="h5"
            component="h1" 
            sx={{ 
              mb: 2,
              fontWeight: 600,
              backgroundImage: theme.colors.primary.gradient,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem'
            }}
          >
            {post.title}
          </Typography>

          <Divider sx={{ my: 3, borderColor: theme.colors.borders.light }} />

          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              color: theme.colors.text.primary,
              lineHeight: 1.6,
              fontSize: '1rem'
            }}
          >
            {post.content}
          </Typography>

          {post.files && post.files.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                  fontSize: '1.125rem'
                }}
              >
                Attachments
              </Typography>
              <Carousel
                showArrows={true}
                showThumbs={false}
                infiniteLoop={true}
                showStatus={false}
                swipeable={true}
                emulateTouch={true}
                autoPlay={false}
                dynamicHeight={true}
                className="custom-carousel"
                sx={{ borderRadius: theme.shape.borderRadius }}
              >
                {post.files.map((file, index) => (
                  <div key={index}>
                    {file.mimetype?.startsWith('image/') ? (
                      <CardMedia
                        component="img"
                        sx={{
                          height: 400,
                          objectFit: "contain",
                          borderRadius: theme.shape.borderRadius,
                          backgroundColor: 'rgba(250, 250, 255, 0.8)'
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
                          borderRadius: theme.shape.borderRadius,
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
                          backgroundColor: theme.colors.background.sidebar,
                          borderRadius: theme.shape.borderRadius,
                          border: `1px dashed ${theme.colors.borders.light}`
                        }}
                      >
                        <Typography 
                          variant="body1"
                          sx={{
                            color: theme.colors.text.primary,
                            fontWeight: 500
                          }}
                        >
                          {file.originalname || `File ${index + 1}`}
                        </Typography>
                      </Box>
                    )}
                  </div>
                ))}
              </Carousel>
            </Box>
          )}

          {/* Reactions and Voting Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderTop: `1px solid ${theme.colors.borders.light}`,
            pt: 2,
            mt: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                onClick={handleOpenReactionMenu}
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  minWidth: "auto",
                  color: theme.colors.text.primary,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  padding: '6px 16px',
                  backgroundColor: theme.colors.action.hover,
                  '&:hover': {
                    backgroundColor: theme.colors.action.selected,
                  },
                  transition: 'all 0.2s ease'
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
                          padding: "3px 10px",
                          borderRadius: "16px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: theme.colors.text.primary,
                          backgroundColor: userReactions[emoji] 
                            ? theme.colors.action.selected 
                            : theme.colors.action.hover,
                          '&:hover': {
                            backgroundColor: theme.colors.action.selected,
                          },
                          transition: 'all 0.2s ease'
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
              <Tooltip title="Upvote">
                <IconButton
                  onClick={() => handleVote(1)}
                  sx={{
                    color: theme.colors.primary.main,
                    '&:hover': {
                      backgroundColor: theme.colors.action.hover,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ThumbUpIcon />
                </IconButton>
              </Tooltip>

              <Typography
                variant="body2"
                sx={{ 
                  mx: 1, 
                  color: theme.colors.text.primary,
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                {votes}
              </Typography>

              <Tooltip title="Downvote">
                <IconButton
                  onClick={() => handleVote(-1)}
                  sx={{
                    color: theme.colors.text.secondary,
                    '&:hover': {
                      backgroundColor: theme.colors.action.hover,
                      transform: 'translateY(2px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ThumbDownIcon />
                </IconButton>
              </Tooltip>
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
            backgroundColor: theme.colors.background.card,
            boxShadow: theme.shadows.cardHover,
            borderRadius: theme.shape.borderRadius,
            padding: '8px',
          },
        }}
      >
        <Box sx={{ display: "flex", padding: "8px" }}>
          {EMOJIS.map((emoji) => (
            <IconButton
              key={emoji}
              onClick={() => handleReactionToggle(emoji)}
              sx={{
                fontSize: "1.25rem",
                margin: '0 2px',
                backgroundColor: userReactions[emoji]
                  ? theme.colors.action.selected
                  : "transparent",
                "&:hover": {
                  backgroundColor: theme.colors.action.hover,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease'
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
          sx={{ 
            width: "100%",
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows.card
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

