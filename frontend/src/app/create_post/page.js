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
} from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
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
  const [userClubsWithPostPermission, setUserClubsWithPostPermission] = useState([]);
  const [userBoardsWithPostPermission, setUserBoardsWithPostPermission] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

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
            (clubId) => result.userData.data.clubs[clubId].posts === true
          );
          setUserClubsWithPostPermission(clubsWithPermission);
        }

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

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    if (!term) {
      if (boardId) {
        setFilteredPosts(posts.filter((post) => post?.board_id === boardId));
      } else {
        setFilteredPosts(posts);
      }
      return;
    }

    const searchFiltered = posts.filter((post) => {
      const contentMatches = post?.content?.toLowerCase().includes(term);
      const titleMatches = post?.title?.toLowerCase().includes(term);
      const userNameMatches = post?.user?.name?.toLowerCase().includes(term);

      return contentMatches || titleMatches || userNameMatches;
    });

    if (boardId) {
      setFilteredPosts(
        searchFiltered.filter((post) => post?.board_id === boardId)
      );
    } else {
      setFilteredPosts(searchFiltered);
    }
  }, [searchTerm, posts, boardId]);

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
      reactionsObj[post?._id] = {};
      userReactionsObj[post?._id] = {};

      if (Array.isArray(post.reactions)) {
        post?.reactions.forEach((reaction) => {
          reactionsObj[post?._id][reaction.emoji] =
            (reactionsObj[post?._id][reaction.emoji] || 0) + 1;

          if (reaction.user_id === userId) {
            userReactionsObj[post?._id][reaction.emoji] = true;
          }
        });
      }

      votesObj[post?._id] =
        post?.votes?.reduce((sum, vote) => sum + (vote.vote || 0), 0) || 0;
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

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Delete failed");

      setPosts((prev) => prev.filter((post) => post?._id !== postId));
      showNotification("Post deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting post:", err);
      showNotification("Failed to delete post", "error");
    }
  };

  const handleReactionToggle = async (emoji, postId) => {
    const hasReaction = userReactions[postId]?.[emoji];

    try {
      const response = await fetch(
        `${API_URL}/posts/${postId}/reactions`,
        {
          method: hasReaction ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, emoji }),
        }
      );

      if (!response.ok) throw new Error(hasReaction ? "Failed to remove reaction" : "Failed to add reaction");

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
      fetchPosts(); // Revert optimistic update if error
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

      setVotes((prev) => ({
        ...prev,
        [postId]: updatedPost?.votes.reduce(
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

  const hasPostPermission = (post) => {
    if (isSuperAdmin) return true;
    if (post?.user_id === userId) return true;

    if (post?.club_id) {
      const clubId = post?.club_id?._id || post.club_id;
      if (userClubsWithPostPermission.includes(clubId)) {
        return true;
      }
    }

    if (post?.board_id) {
      const boardId = post?.board_id?._id || post?.board_id;
      if (userBoardsWithPostPermission.includes(boardId)) {
        return true;
      }
    }

    return false;
  };

  const canCreatePosts = () => {
    if (boardId) {
      if (userBoardsWithPostPermission.includes(boardId)) {
        return true;
      }
      return isSuperAdmin;
    }
    return false;
  };

  if (isNavigating) {
    return (
      <LinearProgress
        sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }}
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

  const renderEmptyState = () => (
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
        {searchTerm
          ? "No posts match your search"
          : boardId
          ? "No posts in this board"
          : "No posts available"}
      </Typography>
      {canCreatePosts() && !searchTerm && (
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpenEditor}>
          Create First Post
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", width: "100%", position: "relative", pb: 8 }}>
      <Box
        sx={{
          width: "25%",
          pr: 2,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: "12px" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Search Posts
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            {filteredPosts.length}{" "}
            {filteredPosts.length === 1 ? "post" : "posts"} found
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ width: "75%" }}>
        {filteredPosts.length === 0
          ? renderEmptyState()
          : filteredPosts.map((post) => (
              <Card
                key={post?._id}
                sx={{ mb: 3, borderRadius: "12px", boxShadow: 3 }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid rgba(0,0,0,0.12)",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <CardHeader
                    avatar={
                      <Avatar src={post.user?.avatar}>
                        {post.user?.name?.charAt(0) || "U"}
                      </Avatar>
                    }
                    title={post.user?.name || "Anonymous"}
                    subheader={new Date(post.createdAt).toLocaleString()}
                    sx={{ padding: 0 }}
                  />
                  {hasPostPermission(post) && (
                    <Box>
                      <IconButton onClick={() => handleEditPost(post)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeletePost(post._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                <CardContent>
                  <Typography variant="h5">{post.title}</Typography>
                  <Typography
                    component="div"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
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
                          <video
                            controls
                            style={{ width: "100%", height: 300 }}
                          >
                            <source
                              src={`${API_URL2}/${file.filename}`}
                              type={file.fileType}
                            />
                          </video>
                        )}
                      </div>
                    ))}
                  </Carousel>
                )}

                <CardActions
                  sx={{
                    borderTop: "1px solid rgba(0,0,0,0.12)",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      onClick={(e) => handleOpenReactionMenu(e, post._id)}
                      sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        minWidth: "auto",
                      }}
                    >
                      😊 React
                    </Button>

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {reactions[post._id] &&
                        Object.entries(reactions[post._id])
                          .filter(([_, count]) => count > 0)
                          .map(([emoji, count]) => (
                            <Tooltip key={emoji} title={`${count} ${emoji}`}>
                              <Button
                                size="small"
                                sx={{
                                  minWidth: "auto",
                                  padding: "0 8px",
                                  borderRadius: "16px",
                                  fontSize: "0.875rem",
                                  backgroundColor: userReactions[post._id]?.[emoji]
                                    ? "rgba(25, 118, 210, 0.08)"
                                    : "transparent",
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
                      onClick={() => handleVote(post._id, 1)}
                      color="primary"
                    >
                      <ThumbUpIcon />
                    </IconButton>
                    <Typography sx={{ mx: 1 }}>
                      {votes[post._id] || 0}
                    </Typography>
                    <IconButton
                      onClick={() => handleVote(post._id, -1)}
                      color="primary"
                    >
                      <ThumbDownIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            ))}
      </Box>

      {canCreatePosts() && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 32, right: 32 }}
          onClick={handleOpenEditor}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog
        open={openEditor}
        onClose={handleCloseEditor}
        maxWidth="md"
        fullWidth
      >
        <PostEditor
          boardId={boardId}
          clubId={clubId}
          onPostCreated={handlePostCreated}
          onClose={handleCloseEditor}
          postToEdit={postToEdit}
        />
      </Dialog>

      <Menu
        anchorEl={reactionMenuAnchorEl}
        open={Boolean(reactionMenuAnchorEl)}
        onClose={handleCloseReactionMenu}
      >
        <Box sx={{ display: "flex", p: 1 }}>
          {EMOJIS.map((emoji) => (
            <IconButton
              key={emoji}
              onClick={() => handleReactionToggle(emoji, currentPostId)}
              sx={{
                fontSize: "1.5rem",
                backgroundColor: userReactions[currentPostId]?.[emoji]
                  ? "rgba(25, 118, 210, 0.08)"
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