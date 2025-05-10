"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Grid,
  useTheme,
  CssBaseline,
  Fab,
  CircularProgress,
  alpha,
  Skeleton,
  CardMedia,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LaunchIcon from "@mui/icons-material/Launch";
import CreateResourceDialog from "../../components/opportunities/CreateResourceDialog";
import { fetchUserData, hasPermission, getAuthToken } from "@/utils/auth";

const getTagColor = (index, theme) => {
  const colors =
    theme.palette.mode === "dark"
      ? [
          "#90caf9",
          "#a5d6a7",
          "#ef9a9a",
          "#ce93d8",
          "#ffcc80",
          "#81d4fa",
          "#b39ddb",
          "#f48fb1",
        ]
      : [
          "#1976d2",
          "#388e3c",
          "#d32f2f",
          "#7b1fa2",
          "#f57c00",
          "#0288d1",
          "#512da8",
          "#c2185b",
        ];
  return colors[index % colors.length];
};

const StatusChip = ({ status }) => {
  const theme = useTheme();

  const getStatusColor = () => {
    const isDark = theme.palette.mode === "dark";

    switch (status?.toLowerCase()) {
      case "active":
        return isDark ? "#81c784" : "#388e3c";
      case "upcoming":
        return isDark ? "#64b5f6" : "#1976d2";
      case "past":
        return isDark ? "#b0bec5" : "#607080";
      default:
        return isDark ? "#b0bec5" : "#607080";
    }
  };

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: alpha(
          getStatusColor(),
          theme.palette.mode === "dark" ? 0.3 : 0.2
        ),
        color: getStatusColor(),
        fontWeight: 500,
        fontSize: "0.7rem",
        height: 24,
        borderRadius: 12,
      }}
    />
  );
};

// Skeleton Card Component for Loading State
const SkeletonCard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      sx={{
        width: "100%",
        height: 400, // Increased height to accommodate image
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        boxShadow: isDark
          ? "0 4px 12px rgba(0, 0, 0, 0.2)"
          : "0 4px 12px rgba(95, 150, 230, 0.1)",
        border: `1px solid ${
          isDark ? "rgba(255, 255, 255, 0.05)" : "transparent"
        }`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          bgcolor: isDark
            ? alpha(theme.palette.primary.main, 0.5)
            : alpha(theme.palette.primary.main, 0.3),
        }}
      />

      {/* Skeleton for the image */}
      <Skeleton variant="rectangular" width="100%" height={120} />

      <CardContent
        sx={{
          p: 3,
          height: "calc(100% - 120px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          mb={1.5}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rounded" width={60} height={24} />
        </Box>

        <Skeleton variant="text" sx={{ mb: 1 }} />
        <Skeleton variant="text" sx={{ mb: 2 }} />

        <Box sx={{ mb: 1 }}>
          <Skeleton variant="text" width="40%" height={24} />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="40%" height={24} />
        </Box>

        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          <Skeleton variant="rounded" width={60} height={22} />
          <Skeleton variant="rounded" width={60} height={22} />
          <Skeleton variant="rounded" width={60} height={22} />
        </Box>

        <Box sx={{ mt: "auto" }}>
          <Skeleton variant="rounded" width={100} height={36} />
        </Box>
      </CardContent>
    </Card>
  );
};

// Opportunity Card Component
const OpportunityCard = ({
  opportunity,
  hasPermission,
  handleEdit,
  handleDelete,
  router,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  console.log(opportunity);

  const gradientColors = isDark
    ? "linear-gradient(90deg, #5f82e6 0%, #9f65ea 100%)"
    : "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)";

  const hoverGradientColors = isDark
    ? "linear-gradient(90deg, #6b8de8 0%, #a670eb 100%)"
    : "linear-gradient(90deg, #5a83e6 0%, #9864e9 100%)";

  // Default placeholder image if opportunity.image_url is not provided
  const imageUrl = `http:localhost:5000/uploads/${opportunity.image.filename}`;
  console.log(imageUrl);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        sx={{
          width: 340, // Fixed width instead of 100%
          height: 480, // Fixed height, slightly reduced from 500
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          boxShadow: isHovered
            ? isDark
              ? "0 12px 20px rgba(0, 0, 0, 0.3)"
              : "0 12px 20px rgba(95, 150, 230, 0.2)"
            : isDark
            ? "0 4px 12px rgba(0, 0, 0, 0.2)"
            : "0 4px 12px rgba(95, 150, 230, 0.1)",
          transition: "all 0.3s ease-in-out",
          border: isHovered
            ? `1px solid ${
                isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(95, 150, 230, 0.3)"
              }`
            : `1px solid ${
                isDark ? "rgba(255, 255, 255, 0.05)" : "transparent"
              }`,
          cursor: "pointer",
          bgcolor: theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={() => router.push(`/current_opportunity/${opportunity._id}`)}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: isHovered ? hoverGradientColors : gradientColors,
            transition: "all 0.3s ease",
            zIndex: 2,
          }}
        />

        <CardMedia
          component="img"
          height="180" // Fixed height in pixels instead of percentage
          image={`http://localhost:5000/uploads/${opportunity.image.filename}`}
          alt={opportunity.title}
          sx={{
            objectFit: "cover", // Changed from "fill" to "cover"
            width: "100%",
            transition: "all 0.3s ease",
            opacity: isHovered ? 0.9 : 0.85,
          }}
        />

        {arrayPermissions[opportunity._id] && (   
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 3,
              display: "flex",
              gap: 0.5,
            }}
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(opportunity._id);
              }}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                },
              }}
            >
              <EditIcon fontSize="small" color="primary" />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(opportunity._id);
              }}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                },
              }}
            >
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Box>
        )}

        <CardContent
          sx={{
            p: 2.5, // Slightly reduced padding to fit content
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: 295, // Fixed content height (480 - 180 - 5)
            overflow: "hidden", // Prevent content overflow
          }}
        >
          <Box
            mb={1}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                transition: "color 0.3s ease",
                color: isHovered
                  ? theme.palette.primary.main
                  : theme.palette.text.primary,
                flex: 1,
                mr: 1,
                fontSize: "1rem", // Slightly smaller font size
                lineHeight: 1.2,
                maxHeight: "2.4rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {opportunity.title}
            </Typography>
            {opportunity.status && <StatusChip status={opportunity.status} />}
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              height: "2.5rem", // Fixed height for description
              overflow: "hidden",
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {opportunity.description}
          </Typography>

          <Box
            sx={{
              mb: 0.75, // Reduced margin
              display: "flex",
              alignItems: "center",
              color: theme.palette.text.secondary,
            }}
          >
            <CalendarTodayIcon
              sx={{ fontSize: 16, mr: 1, color: theme.palette.primary.main }}
            />
            <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
              {formatDate(opportunity.start_date)}
            </Typography>
          </Box>

          <Box
            sx={{
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              color: theme.palette.text.secondary,
            }}
          >
            <EventAvailableIcon
              sx={{ fontSize: 16, mr: 1, color: theme.palette.primary.main }}
            />
            <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
              {formatDate(opportunity.end_date)}
            </Typography>
          </Box>

          {opportunity.tags && opportunity.tags.length > 0 && (
            <Box
              sx={{
                mb: 1.5,
                display: "flex",
                flexWrap: "wrap",
                gap: 0.8,
                height: "2rem", // Fixed height for tags section
                overflow: "hidden",
              }}
            >
              {opportunity.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    backgroundColor: alpha(
                      getTagColor(index, theme),
                      isDark ? 0.2 : 0.1
                    ),
                    color: getTagColor(index, theme),
                    fontSize: "0.65rem",
                    height: 22,
                    "&:hover": {
                      backgroundColor: alpha(
                        getTagColor(index, theme),
                        isDark ? 0.3 : 0.2
                      ),
                    },
                  }}
                />
              ))}
              {opportunity.tags.length > 3 && (
                <Chip
                  label={`+${opportunity.tags.length - 3}`}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.text.secondary,
                    fontSize: "0.65rem",
                    height: 22,
                  }}
                />
              )}
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: "auto", // Pushes the button to the bottom
            }}
          >
            <Button
              variant="contained"
              endIcon={<LaunchIcon />}
              onClick={(e) => {
                e.stopPropagation();
                window.open(opportunity.external_link, "_blank");
              }}
              sx={{
                background: gradientColors,
                boxShadow: isDark
                  ? "0 4px 10px rgba(0, 0, 0, 0.3)"
                  : "0 4px 10px rgba(71, 118, 230, 0.3)",
                borderRadius: 2,
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: hoverGradientColors,
                  boxShadow: isDark
                    ? "0 6px 15px rgba(0, 0, 0, 0.4)"
                    : "0 6px 15px rgba(71, 118, 230, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Apply
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function OpportunitiesPage({
  clubId = null,
  searchQuery = "",
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [
    userClubsWithOpportunityPermission,
    setUserClubsWithOpportunityPermission,
  ] = useState([]);
  const [
    userBoardsWithOpportunityPermission,
    setUserBoardsWithOpportunityPermission,
  ] = useState([]);
  const [authToken, setAuthToken] = useState(null);

  const [selectedClub, setSelectedClub] = useState(clubId);
  const [loading, setLoading] = useState(false); // Changed to false since we use showSkeleton state instead
  const [isLoadingData, setIsLoadingData] = useState(true); // New state to track actual data loading
  const [error, setError] = useState(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const router = useRouter();

  const [arrayPermissions, setArrayPermissions] = useState({});

  const [canCreateOpportunities, setCanCreateOpportunities] = useState(false);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  useEffect(() => {
    async function checkOpportunityCreationPermission() {
      if (isSuperAdmin) {
        setCanCreateOpportunities(true);
        return;
      }
      if (!userData) {
        setCanCreateOpportunities(false);
        return;
      }
      if (boardId) {
        const hasOpportunityPermission = await hasPermission("opportunities", userData, null, clubId);
        setCanCreateOpportunities(hasOpportunityPermission);
        return;
      }
      setCanCreateOpportunities(false);
    }

    checkOpportunityCreationPermission();
  }, [isSuperAdmin, userData, clubId]);

  useEffect(() => {
    // Check permissions for all resources
    if (userData && filteredOpportunities.length > 0) {
      filteredOpportunities.forEach(async (element) => {
        const clubId = element.club_id?._id || element.club_id;
        const boardId = element.board_id?._id || element.board_id;

        // If you must use the async version of hasPermission
        const hasAccess = await hasPermission(
          "opportunities",
          userData,
          boardId,
          clubId
        );

        setArrayPermissions((prev) => ({
          ...prev,
          [element._id]: hasAccess,
        }));
      });
    }
  }, [userData, filteredOpportunities]);

  
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
            (clubId) =>
              result.userData.data.clubs[clubId].opportunities === true
          );
          setUserClubsWithOpportunityPermission(clubsWithPermission);
          if (clubsWithPermission.length > 0) {
            setSelectedClub(clubsWithPermission[0]);
          }
        }

        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData.data.boards
          ).filter(
            (clubId) =>
              result.userData.data.boards[clubId].opportunities === true
          );
          setUserBoardsWithOpportunityPermission(boardsWithPermission);
          if (boardsWithPermission.length > 0 && !clubId) {
            setSelectedBoard(boardsWithPermission[0]);
          }
        }
      }
    }
    loadUserData();
  }, [clubId]);

  const hasOpportunityPermission = (opportunity) => {
    if (isSuperAdmin) return true;

    if (opportunity.club_id) {
      const clubId = opportunity.club_id._id || opportunity.club_id;
      if (userClubsWithOpportunityPermission.includes(clubId)) {
        return true;
      }
    }

    if (opportunity.board_id) {
      const clubId = opportunity.board_id._id || opportunity.board_id;
      if (userBoardsWithOpportunityPermission.includes(clubId)) {
        return true;
      }
    }

    return false;
  };

  const getDefaultClubOrBoardId = () => {
    if (clubId) {
      return {
        type: "board",
        id: clubId,
      };
    }
    if (userClubsWithOpportunityPermission.length > 0) {
      return {
        type: "club",
        id: userClubsWithOpportunityPermission[0],
      };
    }
    if (userBoardsWithOpportunityPermission.length > 0) {
      return {
        type: "board",
        id: userBoardsWithOpportunityPermission[0],
      };
    }
    return null;
  };

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        if (!authToken) return;
        
        setIsLoadingData(true);
        setShowSkeleton(true);

        // Start a timer to ensure skeleton shows for at least 500ms
        const startTime = Date.now();

        let url = "http://localhost:5000/opportunities";
        if (clubId) {
          url += `?board_id=${clubId}`;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch opportunities");
        }

        const data = await response.json();
        setAllOpportunities(data);
        console.log(data);

        // Calculate how much time has passed since fetch started
        const elapsedTime = Date.now() - startTime;
        // If less than 500ms has passed, wait until 500ms is reached
        if (elapsedTime < 500) {
          setTimeout(() => {
            setIsLoadingData(false);
            setShowSkeleton(false);
          }, 500 - elapsedTime);
        } else {
          // If more than 500ms has passed, update immediately
          setIsLoadingData(false);
          setShowSkeleton(false);
        }
      } catch (err) {
        console.error("Error fetching opportunities:", err);
        setError(err.message);
        setIsLoadingData(false);
        setShowSkeleton(false);
      }
    };

    fetchOpportunities();
  }, [clubId, authToken]);

  useEffect(() => {
    let result = allOpportunities;

    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      result = result.filter(
        (opportunity) =>
          opportunity.title?.toLowerCase().includes(search) ||
          opportunity.description?.toLowerCase().includes(search) ||
          (opportunity.tags &&
            opportunity.tags.some((keyword) =>
              keyword.toLowerCase().includes(search)
            ))
      );
    }

    if (selectedKeywords.length > 0) {
      result = result.filter(
        (opportunity) =>
          opportunity.tags &&
          opportunity.tags.some((keyword) => selectedKeywords.includes(keyword))
      );
    }

    setFilteredOpportunities(result);
  }, [searchQuery, allOpportunities, selectedKeywords]);

  const fetchOpportunityDetails = async (id) => {
    try {
      if (!authToken) return;
      
      const response = await fetch(
        `http://localhost:5000/opportunities/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch opportunity details");
      }

      const data = await response.json();
      setEditingOpportunity(data);
      setCreateDialogOpen(true);
    } catch (err) {
      console.error("Error fetching opportunity details:", err);
    }
  };

  const handleEdit = async (opportunityId) => {
    await fetchOpportunityDetails(opportunityId);
  };

  const handleDelete = async (opportunityId) => {
    if (window.confirm("Are you sure you want to delete this opportunity?")) {
      try {
        if (!authToken) return;
        
        const response = await fetch(
          `http://localhost:5000/opportunities/${opportunityId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete opportunity");
        }

        setAllOpportunities(
          allOpportunities.filter((opp) => opp._id !== opportunityId)
        );
      } catch (err) {
        console.error("Error deleting opportunity:", err);
      }
    }
  };

  const handleCreateOpportunity = (newOpportunity) => {
    if (editingOpportunity) {
      setAllOpportunities(
        allOpportunities.map((opp) =>
          opp._id === newOpportunity._id ? newOpportunity : opp
        )
      );
    } else {
      setAllOpportunities([...allOpportunities, newOpportunity]);
    }
    setCreateDialogOpen(false);
    setEditingOpportunity(null);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditingOpportunity(null);
  };

  const defaultContext = getDefaultClubOrBoardId();

  const gradientColors = isDark
    ? "linear-gradient(90deg, #5f82e6 0%, #9f65ea 100%)"
    : "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)";

  const hoverGradientColors = isDark
    ? "linear-gradient(90deg, #6b8de8 0%, #a670eb 100%)"
    : "linear-gradient(90deg, #5a83e6 0%, #9864e9 100%)";

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: theme.palette.background.default,
          flexDirection: "column",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: theme.palette.error.main,
            fontWeight: 600,
          }}
        >
          Something went wrong
        </Typography>
        <Typography variant="body1" color={theme.palette.text.secondary}>
          {error}
        </Typography>
        <Button
          variant="outlined"
          sx={{
            mt: 3,
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            "&:hover": {
              borderColor: theme.palette.primary.dark,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ p: 4, bgcolor: theme.palette.background.default }}>
        <Grid container spacing={3}>
          {showSkeleton ? (
            // Show skeleton cards while loading
            Array(9)
              .fill()
              .map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                  <SkeletonCard />
                </Grid>
              ))
          ) : filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opportunity) => (
              <Grid item xs={12} sm={6} md={4} key={opportunity._id}>
                <OpportunityCard
                  opportunity={opportunity}
                  hasPermission={hasOpportunityPermission(opportunity)}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  router={router}
                />
              </Grid>
            ))
          ) : (
            <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No opportunities found matching your search.
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Try adjusting your search terms or browse all opportunities.
              </Typography>
            </Box>
          )}
        </Grid>
      </Box>

      <CreateResourceDialog
        open={createDialogOpen}
        handleClose={handleDialogClose}
        onSuccess={handleCreateOpportunity}
        initialData={editingOpportunity}
        clubId={selectedClub}
        creatorId={userId}
      />

      {canCreateOpportunities && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            background: gradientColors,
            "&:hover": {
              background: hoverGradientColors,
            },
          }}
          onClick={() => {
            setEditingOpportunity(null);
            setCreateDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </>
  );
}
