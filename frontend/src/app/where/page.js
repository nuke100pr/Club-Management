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
} from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
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

  const router = useRouter();

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
    if (boardId) {
      const filtered = posts.filter((post) => post.board_id === boardId);
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [posts, boardId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = boardId 
        ? `${API_URL}/posts?board_id=${boardId}`
        : `${API_URL}/posts`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

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

      if (Array.isArray(post.reactions)) {
        post.reactions.forEach((reaction) => {
          reactionsObj[post._id][reaction.emoji] =
            (reactionsObj[post._id][reaction.emoji] || 0) + 1;
          
          if (reaction.user_id === userId) {
            userReactionsObj[post._id] = userReactionsObj[post._id] || {};
            userReactionsObj[post._id][reaction.emoji] = true;
          }
        });
      }

      votesObj[post._id] = post.votes?.reduce((sum, vote) => sum + (vote.vote || 0), 0) || 0;
    });

    setReactions(reactionsObj);
    setVotes(votesObj);
    setUserReactions(userReactionsObj);
  };

  const handleOpenEditor = () => setOpenEditor(true);
  const handleCloseEditor = () => setOpenEditor(false);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    handleCloseEditor();
  };

  const handleReactionToggle = async (emoji, postId) => {
    const hasReaction = userReactions[postId]?.[emoji];
    try {
      if (hasReaction) {
        await fetch(`${API_URL}/posts/${postId}/reactions`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, emoji })
        });
      } else {
        await fetch(`${API_URL}/posts/${postId}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, emoji })
        });
      }

      setReactions(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          [emoji]: hasReaction 
            ? (prev[postId]?.[emoji] || 1) - 1
            : (prev[postId]?.[emoji] || 0) + 1
        }
      }));

      setUserReactions(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          [emoji]: !hasReaction
        }
      }));

      showNotification(
        hasReaction ? `Removed ${emoji} reaction` : `Added ${emoji} reaction`,
        "success"
      );
    } catch (err) {
      console.error("Error toggling reaction:", err);
      showNotification("Failed to update reaction", "error");
    }
    handleCloseReactionMenu();
  };

  const handleVote = async (postId, voteValue) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, vote: voteValue })
      });

      if (!response.ok) throw new Error("Vote failed");

      const updatedPost = await response.json();
      setVotes(prev => ({
        ...prev,
        [postId]: updatedPost.votes.reduce((sum, vote) => sum + (vote.vote || 0), 0)
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
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Delete failed");

      setPosts(prev => prev.filter(post => post._id !== postId));
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
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleOpenReactionMenu = (event, postId) => {
    setReactionMenuAnchorEl(event.currentTarget);
    setCurrentPostId(postId);
  };

  const handleCloseReactionMenu = () => {
    setReactionMenuAnchorEl(null);
    setCurrentPostId(null);
  };

  const handleEdit = (postId) => {
    setIsNavigating(true);
    router.push(`/edit-post/${postId}`);
  };

  if (isNavigating) return <LinearProgress sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }} />;
  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}><CircularProgress /></Box>;
  if (error) return (
    <Box sx={{ textAlign: "center", my: 4, p: 2, bgcolor: "background.paper", borderRadius: "12px" }}>
      <Typography color="error">{error}</Typography>
      <Button variant="contained" sx={{ mt: 2 }} onClick={fetchPosts}>Try Again</Button>
    </Box>
  );
  if (filteredPosts.length === 0) return (
    <Box sx={{ textAlign: "center", my: 4, p: 3, bgcolor: "background.paper", borderRadius: "12px" }}>
      <Typography variant="h6">
        {boardId ? "No posts in this board" : "No posts available"}
      </Typography>
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpenEditor}>
        Create First Post
      </Button>
    </Box>
  );

  return (
    <Box sx={{ width: "100%", position: "relative", pb: 8 }}>
      {filteredPosts.map((post) => (
        <Card key={post._id} sx={{ mb: 3, borderRadius: "12px", boxShadow: 3 }}>
          <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.12)", display: "flex", justifyContent: "space-between" }}>
            <CardHeader
              avatar={<Avatar src={post.user?.avatar}>{post.user?.name?.charAt(0) || "U"}</Avatar>}
              title={post.user?.name || "Anonymous"}
              subheader={new Date(post.createdAt).toLocaleString()}
              sx={{ padding: 0 }}
            />
            {(isSuperAdmin || userId === post.user?._id) && (
              <Box>
                <IconButton onClick={() => handleEdit(post._id)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDelete(post._id)}><DeleteIcon /></IconButton>
              </Box>
            )}
          </Box>

          <CardContent>
            <Typography variant="h5">{post.title}</Typography>
            <Typography component="div" dangerouslySetInnerHTML={{ __html: post.content }} />
          </CardContent>

          {post.files?.length > 0 && (
            <Carousel showArrows showThumbs={false} infiniteLoop>
              {post.files.map((file, index) => (
                <div key={index}>
                  {file.fileType === "image" ? (
                    <CardMedia
                      component="img"
                      image={`${API_URL2}/${file.filename}`}
                      alt={file.originalName}
                      sx={{ height: 300, objectFit: "contain" }}
                    />
                  ) : (
                    <video controls style={{ width: "100%", height: 300 }}>
                      <source src={`${API_URL2}/${file.filename}`} type={file.fileType} />
                    </video>
                  )}
                </div>
              ))}
            </Carousel>
          )}

          <CardActions sx={{ borderTop: "1px solid rgba(0,0,0,0.12)", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button onClick={(e) => handleOpenReactionMenu(e, post._id)}>😊 React</Button>
              {reactions[post._id] && Object.entries(reactions[post._id])
                .filter(([_, count]) => count > 0)
                .map(([emoji, count]) => (
                  <Tooltip key={emoji} title={`${count} ${emoji}`}>
                    <Button size="small" sx={{ minWidth: "auto" }}>
                      {emoji} {count}
                    </Button>
                  </Tooltip>
                ))}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => handleVote(post._id, 1)}><ThumbUpIcon /></IconButton>
              <Typography sx={{ mx: 1 }}>{votes[post._id] || 0}</Typography>
              <IconButton onClick={() => handleVote(post._id, -1)}><ThumbDownIcon /></IconButton>
            </Box>
          </CardActions>
        </Card>
      ))}

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 32, right: 32 }}
        onClick={handleOpenEditor}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openEditor} onClose={handleCloseEditor} maxWidth="md" fullWidth>
        <PostEditor
          board_id={boardId}
          club_id={clubId}
          onPostCreated={handlePostCreated}
          onClose={handleCloseEditor}
        />
      </Dialog>

      <Menu
        anchorEl={reactionMenuAnchorEl}
        open={Boolean(reactionMenuAnchorEl)}
        onClose={handleCloseReactionMenu}
      >
        <Box sx={{ display: "flex", p: 1 }}>
          {EMOJIS.map(emoji => (
            <IconButton
              key={emoji}
              onClick={() => handleReactionToggle(emoji, currentPostId)}
              sx={{ fontSize: "1.5rem" }}
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
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Posts;