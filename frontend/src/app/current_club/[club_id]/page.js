// pages/board/[id].js
"use client";
import { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Paper,
  Avatar,
  Grid,
  Chip,
  IconButton,
  InputAdornment,
  useMediaQuery,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LanguageIcon from "@mui/icons-material/Language";
import Head from "next/head";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

import { useThemeContext } from "../../../context/ThemeContext";

import ResourcesComponent from "../../../components/club_admin/ResourcesComponent";
import BlogsComponent from "../../../components/club_admin/BlogsComponent";
import EventsComponent from "../../../components/club_admin/EventsComponent";
import PostsComponent from "../../../components/club_admin/PostsComponent";
import ProjectsComponent from "../../../components/club_admin/ProjectsComponent";
import ForumsComponent from "../../../components/club_admin/ForumsComponent";
import TeamComponent from "../../../components/club_admin/TeamsComponent";
import StatisticsComponent from "../../../components/club_admin/StatsComponent";
import OpportunitiesComponent from "../../../components/club_admin/OpportunityComponent";

import { fetchUserData } from "@/utils/auth";

// Create framer-motion enhanced MUI components
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionIconButton = motion(IconButton);
const MotionAvatar = motion(Avatar);

// Styled components with theme support
const GradientTypography = styled(Typography)(({ theme }) => ({
  backgroundImage: "linear-gradient(90deg, #5d8df7 0%, #a67ff0 100%)",
  backgroundSize: "200% auto",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 600,
  transition: "all 0.5s ease",
  "&:hover": {
    backgroundPosition: "right center",
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: `linear-gradient(90deg, 
      ${theme.palette.primary.main}00 0%, 
      ${theme.palette.primary.main}4D 50%, 
      ${theme.palette.primary.main}00 100%)`,
  },
  "& .MuiTabs-indicator": {
    backgroundColor: "transparent",
    height: 3,
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "100%",
      borderRadius: "3px 3px 0 0",
      background: "linear-gradient(90deg, #5d8df7 0%, #a67ff0 100%)",
    },
  },
  "& .MuiTabs-flexContainer": {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.9rem",
  color: theme.palette.text.secondary,
  flexGrow: 1,
  maxWidth: "none",
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.03)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    color: theme.palette.primary.main,
    "&::before": {
      opacity: 1,
    },
  },
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

const GradientButton = styled(MotionButton)(({ theme }) => ({
  background: "linear-gradient(90deg, #5d8df7 0%, #a67ff0 100%)",
  backgroundSize: "200% auto",
  color: theme.palette.primary.contrastText,
  fontWeight: 500,
  boxShadow: "0 4px 10px rgba(93, 141, 247, 0.3)",
  borderRadius: 8,
  padding: "8px 24px",
  "&:hover": {
    backgroundPosition: "right center",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
  },
  transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
}));

const StyledPaper = styled(MotionPaper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
  padding: 24,
  position: "relative",
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    background: "linear-gradient(90deg, #5d8df7 0%, #a67ff0 100%)",
    opacity: 0.8,
    transform: "translateY(-100%)",
    transition: "transform 0.3s ease",
  },
  "&:hover::before": {
    transform: "translateY(0)",
  },
}));

const StickySearchContainer = styled(MotionBox)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 1000,
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(30, 30, 30, 0.85)"
      : "rgba(248, 250, 255, 0.85)",
  padding: theme.spacing(2, 0),
  backdropFilter: "blur(10px)",
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
}));

const StickyTabsContainer = styled(MotionBox)(({ theme }) => ({
  position: "sticky",
  top: 72, // Height of search bar + padding
  zIndex: 1000,
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(30, 30, 30, 0.85)"
      : "rgba(248, 250, 255, 0.85)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    backgroundColor: theme.palette.background.paper,
    "&.Mui-focused": {
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 4px 15px rgba(93, 141, 247, 0.3)"
          : "0 4px 15px rgba(95, 150, 230, 0.25)",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        borderWidth: "2px",
      },
    },
    "&:hover": {
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 4px 12px rgba(93, 141, 247, 0.2)"
          : "0 4px 12px rgba(95, 150, 230, 0.15)",
    },
  },
}));

const SocialIconButton = styled(MotionIconButton)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: theme.palette.text.secondary,
  "&:hover": {
    color: theme.palette.primary.main,
  },
}));

// Main component
export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.club_id;

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const searchRef = useRef(null);
  const tabsRef = useRef(null);
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [board, setBoard] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithPermission, setUserClubsWithPermission] = useState([]);

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        // Extract clubss with admin permission
        if (result.userData?.clubs) {
          const clubsWithPermission = Object.keys(
            result.userData.clubs
          ).filter((clubId) => result.userData.clubs[clubId].admin === true);
          setUserClubsWithPermission(clubsWithPermission);
        }
      }
    }
    loadUserData();
  }, []);

  const hasPermission = () => {
    // Superadmins have all permissions
    if (isSuperAdmin) return true;

    // Check if user has admin permission for this board
    const hasClubPermission =
      clubId && userClubsWithPermission.includes(clubId);

    return hasClubPermission;
  };

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        setLoading(true);

        const boardUrl = userId
          ? `http://localhost:5000/clubs/clubs/${clubId}?user_id=${userId}`
          : `http://localhost:5000/clubs/clubs/${clubId}`;

        const boardResponse = await fetch(boardUrl);
        if (!boardResponse.ok) throw new Error("Failed to fetch board details");
        const boardData = await boardResponse.json();
        setBoard(boardData);

        const clubsUrl = userId
          ? `http://localhost:5000/clubs/clubs/board/${clubId}?user_id=${userId}`
          : `http://localhost:5000/clubs/clubs/board/${clubId}`;

        const clubsResponse = await fetch(clubsUrl);
        if (!clubsResponse.ok) throw new Error("Failed to fetch clubs");
        const clubsData = await clubsResponse.json();
        setClubs(clubsData);
        console.log(boardData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching board details:", error);
        setError("Failed to load board details. Please try again later.");
        setLoading(false);
      }
    };

    if (clubId) {
      fetchBoardDetails();
    }
  }, [clubId, userId]);

  const handleFollowBoard = async () => {
    try {
      if (!userId) return;

      if (board.isFollowing) {
        const response = await fetch(
          `http://localhost:5000/clubs/users/${userId}/unfollow/board/${clubId}`,
          { method: "DELETE" }
        );

        if (!response.ok) throw new Error("Failed to unfollow board");
        setBoard((prev) => ({
          ...prev,
          isFollowing: false,
          followers: prev.followers - 1,
        }));
      } else {
        const response = await fetch(
          `http://localhost:5000/clubs/users/${userId}/follow/board/${clubId}`,
          { method: "POST" }
        );

        if (!response.ok) throw new Error("Failed to follow board");
        setBoard((prev) => ({
          ...prev,
          isFollowing: true,
          followers: prev.followers + 1,
        }));
      }
    } catch (error) {
      console.error("Error updating board follow status:", error);
    }
  };

  const handleDeleteBoard = async () => {
    try {
      const response = await fetch(`http://localhost:5000/clubs/clubs/${clubId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete board");
      router.push("/clubs");
    } catch (error) {
      console.error("Error deleting board:", error);
      setError("Failed to delete board. Please try again later.");
    }
  };

  const handleFollowClub = async (clubId, e) => {
    e.stopPropagation(); // Prevent event bubbling to the card click
    try {
      if (!userId) return;

      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/follow/club/${clubId}`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error("Failed to follow club");

      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club._id === clubId ? { ...club, isFollowing: true } : club
        )
      );
    } catch (error) {
      console.error("Error following club:", error);
      throw error;
    }
  };

  const handleUnfollowClub = async (clubId, e) => {
    e.stopPropagation(); // Prevent event bubbling to the card click
    try {
      if (!userId) return;

      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/unfollow/club/${clubId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to unfollow club");

      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club._id === clubId ? { ...club, isFollowing: false } : club
        )
      );
    } catch (error) {
      console.error("Error unfollowing club:", error);
      throw error;
    }
  };

  // Tab change handling
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    // Auto scroll tabs on mobile when reaching end tabs
    if ((isMobile || isTablet) && tabsRef.current) {
      const tabsNode = tabsRef.current;
      const selectedTab = tabsNode.querySelector(`[aria-selected=true]`);

      if (selectedTab) {
        // Check if the selected tab is one of the last visible ones
        const tabRect = selectedTab.getBoundingClientRect();
        const tabsRect = tabsNode.getBoundingClientRect();

        // If selected tab is close to right edge, scroll right
        if (tabRect.right > tabsRect.right - 50) {
          tabsNode.scrollLeft += 100;
        }
        // If selected tab is close to left edge, scroll left
        else if (tabRect.left < tabsRect.left + 50) {
          tabsNode.scrollLeft -= 100;
        }
      }
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Handle sticky search bar and tabs
  useEffect(() => {
    const handleScroll = () => {
      if (searchRef.current) {
        const searchPos = searchRef.current.getBoundingClientRect().top;
        setIsSearchSticky(searchPos <= 0);
      }

      if (tabsRef.current) {
        const tabsPos = tabsRef.current.getBoundingClientRect().top;
        setIsTabsSticky(tabsPos <= 72); // Adjust based on search bar height
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/clubs")}
          sx={{ mt: 2 }}
        >
          Back to Clubs
        </Button>
      </Box>
    );
  }

  if (!board) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Board not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/clubs")}
          sx={{ mt: 2 }}
        >
          Back to Clubs
        </Button>
      </Box>
    );
  }

  // Format establishment date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const tabContentVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1], // a smooth "ease-in-out"
      },
    },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const tabComponents = [
    <EventsComponent
      key="events"
      searchQuery={searchQuery}
      clubId={clubId}
      userId={userId}
      isSuperAdmin={isSuperAdmin}
      hasPermission={hasPermission()}
      userData={userData}
    />,
    <PostsComponent
      key="posts"
      searchQuery={searchQuery}
      clubId={clubId}
      userId={userId}
      isSuperAdmin={isSuperAdmin}
      hasPermission={hasPermission()}
      userData={userData}
    />,
    <ProjectsComponent
      key="projects"
      searchQuery={searchQuery}
      clubId={clubId}
      userId={userId}
      isSuperAdmin={isSuperAdmin}
      hasPermission={hasPermission()}
      userData={userData}
    />,
    <ResourcesComponent
      key="resources"
      searchQuery={searchQuery}
      clubId={clubId}
      userId={userId}
      isSuperAdmin={isSuperAdmin}
      hasPermission={hasPermission()}
      userData={userData}
    />,
    <BlogsComponent
      key="blogs"
      searchQuery={searchQuery}
      clubId={clubId}
      userId={userId}
      isSuperAdmin={isSuperAdmin}
      hasPermission={hasPermission()}
      userData={userData}
    />,
    <OpportunitiesComponent
      key="clubs"
      searchQuery={searchQuery}
      clubId={clubId}
      userId={userId}
      clubs={clubs}
    />,
    <ForumsComponent
      key="forums"
      searchQuery={searchQuery}
      clubId={clubId}
      userId={userId}
      isSuperAdmin={isSuperAdmin}
      hasPermission={hasPermission()}
      userData={userData}
    />,
    <TeamComponent
      key="team"
      searchQuery={searchQuery}
      clubId={clubId}
      userId={userId}
      isSuperAdmin={isSuperAdmin}
      hasPermission={hasPermission()}
      userData={userData}
    />,
    <StatisticsComponent
      key="statistics"
      searchQuery={searchQuery}
      clubId={clubId}
      userId={userId}
      isSuperAdmin={isSuperAdmin}
      hasPermission={hasPermission()}
      userData={userData}
    />,
  ];

  return (
    <>
      <Head>
        <title>{board.name}</title>
        <meta name="description" content={board.description} />
      </Head>

      <Container
        maxWidth="xl"
        sx={{
          pt: 4,
          pb: 8,
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
          transition: "background-color 0.3s ease",
        }}
      >
        {/* Back Button */}
        <MotionButton
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/clubs")}
          sx={{ mb: 2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back to Clubs
        </MotionButton>

        {/* Board Header */}
        <StyledPaper
          elevation={0}
          sx={{ mb: 4, pb: 3 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            duration: 0.7,
          }}
          whileHover={{
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
            y: -8,
            transition: { duration: 0.3 },
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <MotionAvatar
                alt={board.name}
                variant="rounded"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
                  transition: { duration: 0.3 },
                }}
                sx={{
                  width: "100%",
                  height: { xs: 180, md: 200 },
                  borderRadius: 4,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                  bgcolor: board.image?.filename
                    ? "transparent"
                    : theme.palette.primary.main,
                  fontSize: "4rem",
                }}
              >
                {board.image?.filename ? (
                  <Box
                    component="img"
                    src={`http://localhost:5000/uploads/${board.image.filename}`}
                    alt={board.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  board.name.charAt(0).toUpperCase()
                )}
              </MotionAvatar>
            </Grid>
            <Grid item xs={12} md={9}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "flex-start" }}
                mb={2}
              >
                <Box>
                  <GradientTypography variant="h4" gutterBottom>
                    {board.name}
                  </GradientTypography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    paragraph
                    sx={{
                      lineHeight: 1.7,
                      fontSize: "1.05rem",
                      maxWidth: "95%",
                    }}
                  >
                    {board.description || "No description available"}
                  </Typography>
                  <MotionBox
                    component={motion.div}
                    variants={staggerChildren}
                    initial="initial"
                    animate="animate"
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    gap={1}
                    mb={{ xs: 2, sm: 0 }}
                  >
                    <motion.div variants={fadeInUp}>
                      <StyledChip
                        icon={<CalendarTodayIcon fontSize="small" />}
                        label={`Established: ${board.established_year}`}
                        size="small"
                        sx={{
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(0, 0, 0, 0.03)",
                          color: theme.palette.primary.main,
                          height: 30,
                          "& .MuiChip-icon": {
                            color: theme.palette.primary.main,
                          },
                          borderRadius: "8px",
                          fontWeight: 500,
                        }}
                      />
                    </motion.div>
                    <motion.div variants={fadeInUp}>
                      <StyledChip
                        icon={<FavoriteIcon fontSize="small" />}
                        label={`${board.totalFollowers || 0} Followers`}
                        size="small"
                        sx={{
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(166, 127, 240, 0.15)"
                              : "rgba(142, 84, 233, 0.1)",
                          color: theme.palette.secondary.main,
                          height: 30,
                          "& .MuiChip-icon": {
                            color: theme.palette.secondary.main,
                          },
                          borderRadius: "8px",
                          fontWeight: 500,
                        }}
                      />
                    </motion.div>
                  </MotionBox>
                </Box>
                <MotionBox
                  sx={{ mt: { xs: 1, sm: 0 } }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {userId && (
                    <GradientButton
                      variant="contained"
                      sx={{ mr: 2 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFollowBoard}
                    >
                      {board.isFollowing ? "Following" : "Follow Board"}
                    </GradientButton>
                  )}
                </MotionBox>
              </Box>

              {/* Social Media Links */}
              {board?.social_media && (
                <MotionBox
                  display="flex"
                  flexWrap="wrap"
                  mt={2}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  {board.social_media.facebook && (
                    <Tooltip title="Facebook">
                      <SocialIconButton
                        component="a"
                        href={board.social_media.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FacebookIcon />
                      </SocialIconButton>
                    </Tooltip>
                  )}
                  {board.social_media.instagram && (
                    <Tooltip title="Instagram">
                      <SocialIconButton
                        component="a"
                        href={board.social_media.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <InstagramIcon />
                      </SocialIconButton>
                    </Tooltip>
                  )}
                  {board.social_media.twitter && (
                    <Tooltip title="Twitter">
                      <SocialIconButton
                        component="a"
                        href={board.social_media.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <TwitterIcon />
                      </SocialIconButton>
                    </Tooltip>
                  )}
                  {board.social_media.linkedin && (
                    <Tooltip title="LinkedIn">
                      <SocialIconButton
                        component="a"
                        href={board.social_media.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <LinkedInIcon />
                      </SocialIconButton>
                    </Tooltip>
                  )}
                  {board.social_media.youtube && (
                    <Tooltip title="YouTube">
                      <SocialIconButton
                        component="a"
                        href={board.social_media.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <YouTubeIcon />
                      </SocialIconButton>
                    </Tooltip>
                  )}
                  {board.social_media.website && (
                    <Tooltip title="Website">
                      <SocialIconButton
                        component="a"
                        href={board.social_media.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <LanguageIcon />
                      </SocialIconButton>
                    </Tooltip>
                  )}
                </MotionBox>
              )}
            </Grid>
          </Grid>
        </StyledPaper>

        {/* Sticky Search Container */}
        <StickySearchContainer
          ref={searchRef}
          sx={{
            boxShadow: isSearchSticky
              ? "0 4px 20px rgba(0, 0, 0, 0.25)"
              : "none",
            py: isSearchSticky ? 2 : 0,
          }}
          initial={false}
          animate={{
            boxShadow: isSearchSticky
              ? "0 4px 20px rgba(0, 0, 0, 0.25)"
              : "none",
            paddingTop: isSearchSticky ? 16 : 0,
            paddingBottom: isSearchSticky ? 16 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <SearchField
            fullWidth
            variant="outlined"
            placeholder="Search posts, events, resources..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={clearSearch}
                    size="small"
                  >
                    <Typography variant="caption" color="text.secondary">
                      Clear
                    </Typography>
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 4,
                height: 48,
                fontSize: "0.95rem",
              },
            }}
          />
        </StickySearchContainer>

        {/* Sticky Tabs Container */}
        <StickyTabsContainer
          ref={tabsRef}
          sx={{
            boxShadow: isTabsSticky ? "0 4px 20px rgba(0, 0, 0, 0.25)" : "none",
            borderBottom: isTabsSticky
              ? "none"
              : `1px solid ${theme.palette.divider}`,
          }}
          initial={false}
          animate={{
            boxShadow: isTabsSticky ? "0 4px 20px rgba(0, 0, 0, 0.25)" : "none",
            borderBottom: isTabsSticky
              ? "none"
              : `1px solid ${theme.palette.divider}`,
          }}
          transition={{ duration: 0.3 }}
        >
          <StyledTabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="Board content tabs"
            sx={{
              "& .MuiTabs-scrollButtons": {
                color: theme.palette.text.primary,
                "&.Mui-disabled": {
                  opacity: 0.3,
                },
              },
            }}
          >
            <StyledTab label="Events" />
            <StyledTab label="Posts" />
            <StyledTab label="Projects" />
            <StyledTab label="Resources" />
            <StyledTab label="Blogs" />
            <StyledTab label="Opportunities" />
            <StyledTab label="Forums" />
            <StyledTab label="Team" />
            <StyledTab label="Statistics" />
          </StyledTabs>
        </StickyTabsContainer>

        {/* Tab Content */}
        <Box mt={4}>
          <MotionBox
            key={tabValue}
            initial="hidden"
            animate="visible"
            variants={tabContentVariants}
          >
            {tabComponents[tabValue]}
          </MotionBox>
        </Box>
      </Container>
    </>
  );
}