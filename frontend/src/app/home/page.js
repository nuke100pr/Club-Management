"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchUserData } from "@/utils/auth";

import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  CssBaseline,
  Divider,
  useMediaQuery,
  useTheme,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  Button,
  TextField,
  Badge,
  InputAdornment,
  Paper,
  Collapse,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Event as EventIcon,
  Work as WorkIcon,
  BusinessCenter as BusinessCenterIcon,
  CalendarToday as CalendarTodayIcon,
  LibraryBooks as LibraryBooksIcon,
  Description as DescriptionIcon,
  Forum as ForumIcon,
  Settings as SettingsIcon,
  Groups as GroupsIcon,
  AdminPanelSettings as AdminIcon,
  WorkOutline as WorkOutlineIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PostAdd as PostAddIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import NOTIFICATIONS from "../../components/home_page/NOTIFICATIONS";
import { colors } from "../../color";

const API_URL = "http://localhost:5000/api";
const API_URL2 = "http://localhost:5000/uploads";

const drawerWidth = 250;
const rightPanelWidth = 350;

const EMOJIS = ["👍", "❤️", "😂", "🔥", "😢", "👏"];

const BASE_SECTIONS = [
  { label: "Events", path: "/events", icon: <EventIcon /> },
  { label: "Projects", path: "/projects", icon: <WorkIcon /> },
  {
    label: "Opportunities",
    path: "/opportunities",
    icon: <BusinessCenterIcon />,
  },
  { label: "Calendar", path: "/calendar", icon: <CalendarTodayIcon /> },
  { label: "Resources", path: "/resources", icon: <LibraryBooksIcon /> },
  { label: "Blogs", path: "/blogs", icon: <DescriptionIcon /> },
  { label: "Forums", path: "/forums", icon: <ForumIcon /> },
  { label: "Clubs", path: "/clubs", icon: <GroupsIcon /> },
  { label: "Admin Panel", path: "/admin_panel", icon: <AdminIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

const CREATE_POST_SECTION = {
  label: "Posts",
  path: "/create_post",
  icon: <PostAddIcon />,
};

const CLUB_AND_BOARD_ADMIN_SECTION = {
  label: "Manage",
  path: "/test3",
  icon: <AdminIcon />,
};

const ClubBoard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [reactions, setReactions] = useState({});
  const [votes, setVotes] = useState({});
  const [eventsCollapsed, setEventsCollapsed] = useState(false);
  const [resourcesCollapsed, setResourcesCollapsed] = useState(false);
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
  const [isClubOrBoardAdmin, setIsClubOrBoardAdmin] = useState(false);


  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);
        setIsClubOrBoardAdmin(result.isBoardAdmin||result.isClubAdmin);
        console.log(result);
      }
    }
    loadUserData();
  }, []);

  

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/posts`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      const postsArray = data.posts || [];

      if (Array.isArray(postsArray)) {
        setPosts(postsArray);

        const reactionsObj = {};
        const votesObj = {};

        postsArray.forEach((post) => {
          // Initialize reactions for this post
          reactionsObj[post._id] = {};

          // Count reactions from the API response
          if (Array.isArray(post.reactions)) {
            post.reactions.forEach((reaction) => {
              reactionsObj[post._id][reaction.emoji] =
                (reactionsObj[post._id][reaction.emoji] || 0) + 1;
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
      } else {
        console.error("Unexpected data format:", data);
        setError("Failed to load posts: Unexpected data format");
        setPosts([]);
      }

      // In the fetchPosts function, after processing reactions:
      const userReactionsObj = {};
      postsArray.forEach((post) => {
        userReactionsObj[post._id] = {};

        if (Array.isArray(post.reactions)) {
          post.reactions.forEach((reaction) => {
            if (reaction.user_id === user_id) {
              userReactionsObj[post._id][reaction.emoji] = true;
            }
          });
        }
      });

      setUserReactions(userReactionsObj);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
      setLoading(false);
    }
  };
  const handleReactionToggle = async (emoji, postId) => {
    // Check if user already has this reaction
    const hasReaction = userReactions[postId]?.[emoji];

    if (hasReaction) {
      await handleRemoveReaction(emoji, postId);

      // Update user reactions state
      setUserReactions((prev) => ({
        ...prev,
        [postId]: {
          ...(prev[postId] || {}),
          [emoji]: false,
        },
      }));
    } else {
      // Use the existing handleAddReaction but with parameters
      await handleAddReaction(emoji, postId);

      // Update user reactions state
      setUserReactions((prev) => ({
        ...prev,
        [postId]: {
          ...(prev[postId] || {}),
          [emoji]: true,
        },
      }));
    }

    handleCloseReactionMenu();
  };
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleNavigation = (path) => {
    setIsNavigating(true);
    router.push(path);
    if (isMobile) setMobileOpen(false);
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
    if (!currentPostId) return;

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

      // Update reactions state directly instead of fetching all posts
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
    } finally {
      handleCloseReactionMenu();
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

      // Update state directly instead of fetching all posts
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

      // Update reactions state directly
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

      setNotification({
        open: true,
        message: `Removed ${emoji} reaction!`,
        severity: "success",
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

  const handleRemoveVote = async (id) => {
    try {
      const response = await fetch(`${API_URL}/posts/${id}/votes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      fetchPosts();

      setNotification({
        open: true,
        message: "Vote removed successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error removing vote:", err);
      setNotification({
        open: true,
        message: "Failed to remove vote. Please try again.",
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

  const toggleEventsCollapse = () => setEventsCollapsed(!eventsCollapsed);
  const toggleResourcesCollapse = () =>
    setResourcesCollapsed(!resourcesCollapsed);

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const sidebarStyles = {
    width: drawerWidth,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      boxSizing: "border-box",
      backgroundColor: "#0a1929",
      color: "white",
      boxShadow: "0 0 15px rgba(0,0,0,0.2)",
    },
  };

  const cardStyles = {
    marginBottom: 3,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    borderRadius: "8px",
    overflow: "hidden",
  };



  const SECTIONS1 = isSuperAdmin
    ? [CREATE_POST_SECTION, ...BASE_SECTIONS]
    : [...BASE_SECTIONS];

    const SECTIONS = isClubOrBoardAdmin
    ? [CLUB_AND_BOARD_ADMIN_SECTION, ...SECTIONS1]
    : [...SECTIONS1];


  const handleEdit = (postId) => {
    router.push(`/edit_post/${postId}`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: colors.background.default,
      }}
    >
      <CssBaseline />

      {isNavigating && (
        <LinearProgress
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            height: 4,
            backgroundColor: colors.primary.light,
            "& .MuiLinearProgress-bar": {
              backgroundColor: colors.primary.main,
            },
          }}
        />
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: colors.background.sidebar,
            color: colors.common.white,
          },
        }}
      >
        <Box sx={{ height: "100vh", padding: 2 }}>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              marginBottom: 2,
              fontWeight: "bold",
              letterSpacing: "0.5px",
              borderBottom: `2px solid ${colors.secondary.main}`,
              paddingBottom: 1,
              color: colors.common.white,
            }}
          >
            Club Board
          </Typography>
          <Divider
            sx={{ borderColor: "rgba(255, 255, 255, 0.1)", marginBottom: 2 }}
          />
          <List>
            {SECTIONS.map((section, index) => (
              <ListItem
                key={index}
                onClick={() => handleNavigation(section.path)}
                sx={{
                  "&:hover": {
                    backgroundColor: colors.action.hover,
                    borderRadius: "4px",
                  },
                  mb: 0.5,
                  position: "relative",
                  transition: "background-color 0.3s ease",
                }}
                disabled={isNavigating}
              >
                <ListItemIcon sx={{ color: colors.secondary.light }}>
                  {section.icon}
                </ListItemIcon>
                <ListItemText
                  primary={section.label}
                  primaryTypographyProps={{
                    fontWeight: "medium",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
          flexGrow: 1,
          backgroundColor: colors.background.default,
          padding: 3,
          overflowY: "auto",
          width: isMobile
            ? "100%"
            : `calc(100% - ${drawerWidth}px - ${rightPanelWidth}px - 200px)`,
          marginX: isMobile ? 0 : "100px",
          padding: isMobile ? 1 : 3,
        }}
      >
        {isMobile && (
          <AppBar
            position="fixed"
            sx={{
              backgroundColor: colors.primary.dark,
              width: "100%",
              boxShadow: colors.shadows.card,
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Club Board
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box
          sx={{
            marginTop: isMobile ? 8 : 0,
            padding: 2,
            backgroundColor: colors.common.white,
            borderRadius: "12px",
            boxShadow: colors.shadows.card,
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            overflow: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
            transition: "box-shadow 0.3s ease",
            "&:hover": {
              boxShadow: colors.shadows.hover,
            },
          }}
        >
          {/* Empty box maintained as in original */}
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress sx={{ color: colors.primary.main }} />
          </Box>
        ) : error ? (
          <Box
            sx={{
              textAlign: "center",
              my: 4,
              p: 2,
              bgcolor: colors.status.error + "15",
              borderRadius: "12px",
              border: colors.borders.light,
            }}
          >
            <Typography color="error">{error}</Typography>
            <Button
              variant="contained"
              sx={{
                mt: 2,
                backgroundColor: colors.primary.main,
                "&:hover": {
                  backgroundColor: colors.primary.dark,
                },
              }}
              onClick={fetchPosts}
            >
              Try Again
            </Button>
          </Box>
        ) : posts.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              my: 4,
              p: 3,
              bgcolor: colors.common.white,
              borderRadius: "12px",
              boxShadow: colors.shadows.card,
            }}
          >
            <Typography variant="h6" color={colors.text.primary}>
              No posts available
            </Typography>
            <Typography
              variant="body2"
              color={colors.text.secondary}
              sx={{ mt: 1 }}
            >
              Be the first to create a post!
            </Typography>
            {true && (
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: colors.primary.main,
                  "&:hover": {
                    backgroundColor: colors.primary.dark,
                  },
                }}
                onClick={() => handleNavigation("/create_post")}
                startIcon={<PostAddIcon />}
                disabled={isNavigating}
              >
                Create Post
              </Button>
            )}
          </Box>
        ) : (
          posts.map((post) => (
            <Card
              key={post._id}
              sx={{
                mb: 3,
                borderRadius: "12px",
                boxShadow: colors.shadows.card,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: colors.shadows.hover,
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: colors.borders.light,
                  padding: "12px",
                  backgroundColor: colors.background.paper,
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
                  title={post.user?.name || "Prakhar Maurya"}
                  subheader={new Date().toLocaleString()}
                  sx={{ padding: 0 }}
                />

                {isSuperAdmin && (
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
                  sx={{ color: colors.text.primary }}
                  component="div"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
              {post.files && post.files.length > 0 && (
                <Carousel
                  showArrows={true}
                  showThumbs={false}
                  infiniteLoop={true}
                >
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
                  borderTop: colors.borders.light,
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
                      color: colors.text.primary,
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
                                color: colors.text.primary,
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

                  <Typography
                    variant="body2"
                    sx={{ mx: 1, color: colors.text.primary }}
                  >
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
          ))
        )}

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
                onClick={() => handleReactionToggle(emoji, currentPostId)}
                sx={{
                  fontSize: "1.5rem",
                  backgroundColor: userReactions[currentPostId]?.[emoji]
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

        {isMobile && (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: colors.background.paper,
                  padding: "12px 16px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  boxShadow: colors.shadows.card,
                }}
                onClick={toggleEventsCollapse}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: colors.primary.main }}
                >
                  Upcoming Events
                </Typography>
                {!eventsCollapsed ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              <Collapse in={!eventsCollapsed}>
                <Card sx={{ mb: 2, boxShadow: colors.shadows.card }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.primary.main, fontWeight: "bold" }}
                    >
                      Web Development Workshop
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      March 18, 2025 • 3:00 PM
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ mb: 2, boxShadow: colors.shadows.card }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.primary.main, fontWeight: "bold" }}
                    >
                      Design Thinking Meetup
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      March 22, 2025 • 2:00 PM
                    </Typography>
                  </CardContent>
                </Card>
              </Collapse>
            </Box>

            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: colors.background.paper,
                  padding: "12px 16px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  boxShadow: colors.shadows.card,
                }}
                onClick={toggleResourcesCollapse}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: colors.primary.main }}
                >
                  Popular Resources
                </Typography>
                {!resourcesCollapsed ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              <Collapse in={!resourcesCollapsed}>
                <List disablePadding>
                  <ListItem
                    dense
                    button
                    sx={{
                      "&:hover": {
                        backgroundColor: colors.action.hover,
                      },
                    }}
                  >
                    <ListItemText
                      primary="Getting Started Guide"
                      secondary="PDF • 245 KB"
                      primaryTypographyProps={{ color: colors.text.primary }}
                      secondaryTypographyProps={{
                        color: colors.text.secondary,
                      }}
                    />
                  </ListItem>
                  <ListItem
                    dense
                    button
                    sx={{
                      "&:hover": {
                        backgroundColor: colors.action.hover,
                      },
                    }}
                  >
                    <ListItemText
                      primary="Club Guidelines"
                      secondary="PDF • 180 KB"
                      primaryTypographyProps={{ color: colors.text.primary }}
                      secondaryTypographyProps={{
                        color: colors.text.secondary,
                      }}
                    />
                  </ListItem>
                </List>
              </Collapse>
            </Box>
          </Box>
        )}

        <NOTIFICATIONS />

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{
              width: "100%",
              backgroundColor:
                notification.severity === "error"
                  ? colors.status.error
                  : notification.severity === "success"
                  ? colors.status.success
                  : notification.severity === "warning"
                  ? colors.status.warning
                  : colors.status.info,
              color: colors.common.white,
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>

      {!isMobile && (
        <Box
          sx={{
            width: rightPanelWidth,
            backgroundColor: colors.background.paper,
            borderLeft: colors.borders.light,
            padding: 2,
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              mb: 2,
              color: colors.primary.main,
            }}
          >
            Upcoming Events
          </Typography>

          <Card
            sx={{
              mb: 2,
              borderRadius: "12px",
              boxShadow: colors.shadows.card,
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                sx={{
                  color: colors.primary.main,
                  fontWeight: "bold",
                }}
              >
                Web Development Workshop
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                March 18, 2025 • 3:00 PM
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              mb: 2,
              borderRadius: "12px",
              boxShadow: colors.shadows.card,
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                sx={{
                  color: colors.primary.main,
                  fontWeight: "bold",
                }}
              >
                Design Thinking Meetup
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                March 22, 2025 • 2:00 PM
              </Typography>
            </CardContent>
          </Card>

          <Divider sx={{ my: 2, borderColor: colors.borders.light }} />

          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              mb: 2,
              color: colors.primary.main,
            }}
          >
            Popular Resources
          </Typography>

          <List disablePadding>
            <ListItem
              dense
              button
              sx={{
                "&:hover": {
                  backgroundColor: colors.action.hover,
                },
                borderRadius: "8px",
              }}
            >
              <ListItemText
                primary="Getting Started Guide"
                secondary="PDF • 245 KB"
                primaryTypographyProps={{ color: colors.text.primary }}
                secondaryTypographyProps={{ color: colors.text.secondary }}
              />
            </ListItem>
            <ListItem
              dense
              button
              sx={{
                "&:hover": {
                  backgroundColor: colors.action.hover,
                },
                borderRadius: "8px",
                mt: 1,
              }}
            >
              <ListItemText
                primary="Club Guidelines"
                secondary="PDF • 180 KB"
                primaryTypographyProps={{ color: colors.text.primary }}
                secondaryTypographyProps={{ color: colors.text.secondary }}
              />
            </ListItem>
          </List>
        </Box>
      )}
    </Box>
  );
};

export default ClubBoard;
