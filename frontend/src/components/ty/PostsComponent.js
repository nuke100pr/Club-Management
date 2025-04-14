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
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  Tooltip,
  Dialog,
  Fab,
  Skeleton,
} from "@mui/material";
import {
  ThumbUp,
  ThumbDown,
  Comment as CommentIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { fetchUserData } from "@/utils/auth";
import PostEditor from "../posts/PostEditor";

const API_URL = "http://localhost:5000/api";
const API_URL2 = "http://localhost:5000/uploads";
const EMOJIS = ["👍", "❤️", "😂", "🔥", "😢", "👏"];

const Posts = ({ boardId, clubId, searchQuery = "" }) => {
  const router = useRouter();
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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [openEditor, setOpenEditor] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [userClubsWithPostPermission, setUserClubsWithPostPermission] =
    useState([]);
  const [userBoardsWithPostPermission, setUserBoardsWithPostPermission] =
    useState([]);
  const [expandedPost, setExpandedPost] = useState(null);
  const [skeletonLoading, setSkeletonLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        if (result.userData?.data?.clubs) {
          setUserClubsWithPostPermission(
            Object.keys(result.userData.data.clubs).filter(
              (clubId) => result.userData.data.clubs[clubId].posts === true
            )
          );
        }

        if (result.userData?.data?.boards) {
          setUserBoardsWithPostPermission(
            Object.keys(result.userData.data.boards).filter(
              (boardId) => result.userData.data.boards[boardId].posts === true
            )
          );
        }
      }
    }
    loadUserData();
    fetchPosts();
  }, []);

  useEffect(() => {
    let filtered = [...posts];

    if (boardId) {
      filtered = filtered.filter((post) => post?.board_id === boardId);
    }

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
    console.log(filtered);
  }, [posts, boardId, searchQuery]);

  const hasPostPermission = (post) => {
    if (isSuperAdmin || post.user_id === userId) return true;

    if (post.club_id) {
      const clubId = post.club_id._id || post.club_id;
      if (userClubsWithPostPermission.includes(clubId)) return true;
    }

    if (post?.board_id) {
      const boardId = post?.board_id?._id || post?.board_id;
      if (userBoardsWithPostPermission.includes(boardId)) return true;
    }

    return false;
  };

  const canCreatePosts = () => {
    if (isSuperAdmin) {
      return true;
    }
    return boardId
      ? userBoardsWithPostPermission.includes(boardId) || isSuperAdmin
      : false;
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setSkeletonLoading(true);

      // Set minimum loading time of 2 seconds
      const minLoadTime = new Promise((resolve) => setTimeout(resolve, 500));

      const url = boardId
        ? `${API_URL}/posts?board_id=${boardId}`
        : `${API_URL}/posts`;
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
      setPosts((prev) =>
        prev.map((post) => (post._id === newPost._id ? newPost : post))
      );
    } else {
      setPosts((prev) => [newPost, ...prev]);
    }
    handleCloseEditor();
  };

  const handleEditPost = async (post) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/posts/${post._id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch post details: ${response.status}`);
      }

      const fullPostData = await response.json();
      setPostToEdit(fullPostData.post || fullPostData);
      setOpenEditor(true);
    } catch (err) {
      console.error("Error fetching post details:", err);
      showNotification("Failed to load post for editing", "error");
    } finally {
      setLoading(false);
    }
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

  // Skeleton loading components
  const SkeletonPostCard = () => (
    <Card
      style={{
        marginBottom: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(95, 150, 230, 0.1)",
        maxWidth: "700px",
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
          style={{ marginBottom: "12px" }}
        />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
      </CardContent>
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
  if (skeletonLoading)
    return (
      <Box
        style={{
          minHeight: "100vh",
          padding: "24px",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        {[1, 2, 3].map((item) => (
          <SkeletonPostCard key={item} />
        ))}
      </Box>
    );

  // Error state with modern styling
  if (error)
    return (
      <Box
        style={{
          textAlign: "center",
          margin: "32px 0",
          padding: "48px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
          maxWidth: "600px",
          margin: "0 auto",
          marginTop: "64px",
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
          onClick={fetchPosts}
          style={{
            padding: "8px 32px",
            background: "linear-gradient(90deg, #4776E6, #8E54E9)",
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

  // Empty state with modern styling
  const renderEmptyState = () => (
    <Box
      style={{
        textAlign: "center",
        margin: "48px 0",
        padding: "48px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
        maxWidth: "700px",
        margin: "0 auto",
        marginTop: "48px",
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
        {searchQuery
          ? "No posts match your search"
          : boardId
          ? "No posts in this board"
          : "No posts available"}
      </Typography>
    </Box>
  );

  return (
    <Box
      style={{
        minHeight: "100vh",
        padding: "24px",
        position: "relative",
      }}
    >
      {filteredPosts.length === 0 ? (
        renderEmptyState()
      ) : (
        <Box style={{ maxWidth: "700px", margin: "0 auto" }}>
          {filteredPosts.map((post) => (
            <Card
              key={post._id}
              style={{
                marginBottom: "24px",
                overflow: "hidden",
                borderRadius: "12px",
                boxShadow: "0 4px 8px rgba(95, 150, 230, 0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 8px 16px rgba(95, 150, 230, 0.2)",
                  transform: "translateY(-4px)",
                },
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
                    {post.board?.image?.filename || post.club?.image?.filename}
                  </Avatar>
                }
                action={
                  hasPostPermission(post) && (
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPost(post);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(post._id);
                          }}
                          style={{
                            color: "#EF4444",
                            padding: "8px",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
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
                  padding: "12px 16px",
                }}
              />

              <CardContent
                style={{
                  padding: "16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.01)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  style={{
                    marginBottom: "12px",
                    fontWeight: 600,
                    color: "#2196F3",
                  }}
                >
                  {post.title}
                </Typography>
                <Typography
                  component="div"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  style={{
                    maxHeight: "80px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    color: "#2196F3",
                    marginBottom: "12px",
                  }}
                />
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToPost(post._id);
                  }}
                  style={{
                    marginTop: "8px",
                    fontWeight: 500,
                    color: "#4776E6",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 16px",
                    fontSize: "0.8rem",
                    "&:hover": {
                      backgroundColor: "rgba(71, 118, 230, 0.05)",
                    },
                  }}
                >
                  Read more
                </Button>
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
                      <Box key={index} style={{ height: "250px" }}>
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
                  padding: "12px 16px",
                }}
              >
                <Box style={{ display: "flex", alignItems: "center" }}>
                  <Tooltip title="Like">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(post._id, 1);
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(post._id, -1);
                      }}
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
                    onClick={(e) => handleOpenReactionMenu(e, post._id)}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(
                        `${window.location.origin}/post/${post._id}`
                      );
                      showNotification("Link copied to clipboard", "success");
                    }}
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
          ))}
        </Box>
      )}

      {/* Floating Action Button for creating new posts */}
      {canCreatePosts() && (
        <Fab
          aria-label="create post"
          onClick={handleOpenEditor}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 1000,
            width: "56px",
            height: "56px",
            background: "linear-gradient(90deg, #4776E6, #8E54E9)",
            color: "white",
            boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
              transform: "scale(1.05)",
            },
          }}
        >
          <AddIcon />
        </Fab>
      )}

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
              onClick={() => handleReactionToggle(emoji, currentPostId)}
              style={{
                fontSize: "20px",
                backgroundColor: userReactions[currentPostId]?.[emoji]
                  ? "rgba(71, 118, 230, 0.1)"
                  : "transparent",
                border: userReactions[currentPostId]?.[emoji]
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
          boardId={boardId}
          clubId={clubId}
          onPostCreated={handlePostCreated}
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

export default Posts;
