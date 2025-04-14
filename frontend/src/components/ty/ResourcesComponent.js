// pages/resources.js

import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    IconButton,
    Stack,
    Tooltip,
    Skeleton,
    Fab,
  } from "@mui/material";
  import { Edit, Delete, Share, Visibility } from "@mui/icons-material";
  import AddIcon from "@mui/icons-material/Add";
  import { useTheme } from "@mui/material/styles";
  import { useEffect, useState } from "react";
  import { fetchUserData } from "@/utils/auth";
  import CreateResourceDialog from "../../components/resources/CreateResourceDialog";
  
  // Add fade-in animation styles
  const fadeInAnimation = {
    "@keyframes fadeIn": {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    animation: "fadeIn 0.5s ease-in",
  };
  
  const getTagColor = (index) => {
    const colors = [
      "#1976d2",
      "#388e3c",
      "#d32f2f",
      "#7b1fa2",
      "#f57c00",
      "#455a64",
      "#00796b",
      "#c2185b",
    ];
    return colors[index % colors.length];
  };
  
  export default function ResourcesPage({ boardId = null, searchQuery = "" }) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [allResources, setAllResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [userClubsWithResourcePermission, setUserClubsWithResourcePermission] =
      useState([]);
    const [
      userBoardsWithResourcePermission,
      setUserBoardsWithResourcePermission,
    ] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState(boardId);
    const [selectedClub, setSelectedClub] = useState(null);
   
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
              (clubId) => result.userData.data.clubs[clubId].resources === true
            );
            setUserClubsWithResourcePermission(clubsWithPermission);
          }
  
          if (result.userData?.data?.boards) {
            const boardsWithPermission = Object.keys(
              result.userData.data.boards
            ).filter(
              (boardId) => result.userData.data.boards[boardId].resources === true
            );
            setUserBoardsWithResourcePermission(boardsWithPermission);
          }
        }
      }
      loadUserData();
    }, []);
  
    const hasResourcePermission = (resource) => {
      if (isSuperAdmin) return true;
  
      if (resource.club_id) {
        const clubId = resource.club_id._id || resource.club_id;
        if (userClubsWithResourcePermission.includes(clubId)) {
          return true;
        }
      }
  
      if (resource.board_id) {
        const boardId = resource.board_id._id || resource.board_id;
        if (userBoardsWithResourcePermission.includes(boardId)) {
          return true;
        }
      }
  
      return false;
    };
  
    const canCreateResources = () => {
      if (isSuperAdmin) {
        return true;
      }
      if (boardId) {
        if (userBoardsWithResourcePermission.includes(boardId)) {
          return true;
        }
        return isSuperAdmin;
      }
      return false;
    };
  
    const getDefaultClubOrBoardId = () => {
      if (boardId) {
        return {
          type: "board",
          id: boardId,
        };
      }
      if (userClubsWithResourcePermission.length > 0) {
        return {
          type: "club",
          id: userClubsWithResourcePermission[0],
        };
      }
      if (userBoardsWithResourcePermission.length > 0) {
        return {
          type: "board",
          id: userBoardsWithResourcePermission[0],
        };
      }
      return null;
    };
  
    useEffect(() => {
      const fetchResources = async () => {
        try {
          // Set loading to true at the start of data fetch
          setLoading(true);
          
          // Record start time for minimum loading duration
          const fetchStart = Date.now();
          const minLoadingTime = 500; // Minimum 2.5 seconds to show skeleton
          
          let url = "http://localhost:5000/resources/api/resource";
          if (boardId) {
            url += `?board_id=${boardId}`;
          }
  
          const response = await fetch(url);
          const result = await response.json();
  
          if (result.success && result.data) {
            const formattedResources = result.data.map((resource) => ({
              id: resource._id,
              title: resource.title,
              description: resource.description,
              keywords: resource.tags || [],
              publishedBy: resource.user_id || "Unknown",
              publishedAt: resource.published_at,
              url: resource.resource_link,
              tags: resource.tags || [],
              club_id: resource.club_id || null,
              board_id: resource.board_id || null,
            }));
  
            // Calculate how long we've been loading
            const loadingElapsed = Date.now() - fetchStart;
            
            // If we haven't reached our minimum loading time, delay updating the state
            if (loadingElapsed < minLoadingTime) {
              setTimeout(() => {
                setAllResources(formattedResources);
                setLoading(false);
              }, minLoadingTime - loadingElapsed);
            } else {
              // We've already loaded longer than minimum, update immediately
              setAllResources(formattedResources);
              setLoading(false);
            }
          }
        } catch (error) {
          console.error("Error fetching resources:", error);
          // Even on error, maintain minimum loading time
          setTimeout(() => setLoading(false), 2000);
        }
      };
  
      fetchResources();
    }, [boardId]);
  
    useEffect(() => {
      let result = allResources;
  
      if (searchQuery.trim()) {
        const search = searchQuery.toLowerCase();
        result = result.filter(
          (resource) =>
            resource.title.toLowerCase().includes(search) ||
            resource.description.toLowerCase().includes(search) ||
            resource.keywords.some((keyword) =>
              keyword.toLowerCase().includes(search)
            )
        );
      }
  
      setFilteredResources(result);
    }, [searchQuery, allResources]);
  
    const shareResource = (resource) => {
      if (navigator.share) {
        navigator
          .share({
            title: resource.title,
            text: resource.description,
            url: resource.url,
          })
          .catch((error) => console.error("Error sharing:", error));
      } else {
        navigator.clipboard
          .writeText(resource.url)
          .then(() => alert("Link copied to clipboard: " + resource.url))
          .catch((err) => console.error("Failed to copy link: ", err));
      }
    };
  
    const handleEdit = async (resourceId) => {
      try {
        const response = await fetch(
          `http://localhost:5000/resources/api/resource/${resourceId}`
        );
        const result = await response.json();
  
        if (result.success) {
          const editResource = {
            id: result.data._id,
            title: result.data.title,
            description: result.data.description,
            resource_link: result.data.resource_link,
            published_at: result.data.published_at,
            tags: result.data.tags || [],
            club_id: result.data.club_id || null,
            board_id: result.data.board_id || null,
          };
  
          setEditingResource(editResource);
          setCreateDialogOpen(true);
        }
      } catch (error) {
        console.error("Error fetching resource details:", error);
      }
    };
  
    const handleDelete = async (resourceId) => {
      if (window.confirm("Are you sure you want to delete this resource?")) {
        try {
          const response = await fetch(
            `http://localhost:5000/resources/bpi/${resourceId}`,
            {
              method: "DELETE",
            }
          );
          const result = await response.json();
  
          if (result.success) {
            setAllResources((prev) => prev.filter((r) => r.id !== resourceId));
          }
        } catch (error) {
          console.error("Error deleting resource:", error);
        }
      }
    };
  
    const handleCreateResource = (newResource) => {
      setAllResources((prev) => [...prev, newResource]);
      setCreateDialogOpen(false);
    };
  
    const handleUpdateResource = (updatedResource) => {
      setAllResources((prev) =>
        prev.map((r) => (r.id === updatedResource.id ? updatedResource : r))
      );
      setCreateDialogOpen(false);
      setEditingResource(null);
    };
  
    const handleDialogClose = () => {
      setCreateDialogOpen(false);
      setEditingResource(null);
    };
  
    const defaultContext = getDefaultClubOrBoardId();
  
    // Enhanced skeleton with more random variations for a more natural appearance
    const renderSkeletonCard = (index) => (
      <Grid item xs={1} key={`skeleton-${index}`}>
        <Card
          sx={{
            height: "100%",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
          }}
        >
          <Skeleton
            variant="rectangular"
            height={4}
            sx={{ bgcolor: "#4776E6", borderRadius: "16px 16px 0 0" }}
            animation="wave"
          />
          <CardContent sx={{ p: 3 }}>
            {/* Vary the width of skeletons slightly for more natural appearance */}
            <Skeleton height={22} width={`${40 + Math.random() * 20}%`} sx={{ mb: 1 }} animation="wave" />
            <Skeleton height={28} width={`${70 + Math.random() * 20}%`} sx={{ mb: 1 }} animation="wave" />
            <Skeleton height={20} width="100%" sx={{ mb: 2 }} animation="wave" />
            <Skeleton height={20} width={`${85 + Math.random() * 15}%`} sx={{ mb: 2 }} animation="wave" />
            <Skeleton height={20} width={`${30 + Math.random() * 30}%`} sx={{ mb: 2 }} animation="wave" />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Skeleton variant="rectangular" height={36} width={100} animation="wave" sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={36} width={100} animation="wave" sx={{ borderRadius: 1 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  
    return (
      <Box p={4} minHeight="100vh">
        <Grid container spacing={3} columns={{ xs: 1, md: 3 }}>
          {loading ? (
            // Render skeleton cards
            Array.from({ length: 6 }).map((_, index) => renderSkeletonCard(index))
          ) : filteredResources.length > 0 ? (
            // Render actual content with fade-in animation
            filteredResources.map((resource) => (
              <Grid item xs={1} key={resource.id}>
                <div style={{ height: "100%" }}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 6,
                      boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 20px rgba(95, 150, 230, 0.2)",
                      },
                      position: "relative",
                      ...fadeInAnimation, // Apply fade-in animation
                    }}
                  >
                    {/* Edit/Delete buttons */}
                    {hasResourcePermission(resource) && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          borderRadius: 1,
                          padding: "4px",
                          display: "flex",
                          gap: "4px",
                        }}
                      >
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEdit(resource.id)}
                            color="primary"
                            size="small"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDelete(resource.id)}
                            color="error"
                            size="small"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
  
                    <Box
                      sx={{
                        borderTop: "4px solid #4776E6",
                        borderRadius: "16px 16px 0 0",
                      }}
                    />
  
                    <CardContent
                      sx={{
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                      }}
                    >
                      <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                        {resource.tags.map((tag, idx) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              fontSize: "0.65rem",
                              height: 22,
                              bgcolor: `${getTagColor(idx)}20`,
                              color: getTagColor(idx),
                            }}
                          />
                        ))}
                      </Stack>
  
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        gutterBottom
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 1,
                        }}
                      >
                        {resource.title}
                      </Typography>
  
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 2,
                        }}
                      >
                        {resource.description}
                      </Typography>
  
                      <Box mt="auto" mb={2}>
                        <Typography variant="caption" color="text.secondary">
                          Published by <strong>{resource.publishedBy}</strong>
                          <br />
                          Published at{" "}
                          <strong>
                            {new Date(
                              resource.publishedAt
                            ).toLocaleDateString()}
                          </strong>
                        </Typography>
                      </Box>
  
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                          variant="contained"
                          startIcon={<Visibility />}
                          onClick={() => window.open(resource.url, "_blank")}
                          sx={{
                            background:
                              "linear-gradient(to right, #4776E6, #8E54E9)",
                            boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                            textTransform: "none",
                            fontWeight: 500,
                            "&:hover": {
                              background:
                                "linear-gradient(to right, #3a5fc0, #7b3fe0)",
                              boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          View
                        </Button>
  
                        <Button
                          variant="outlined"
                          startIcon={<Share />}
                          onClick={() => shareResource(resource)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 500,
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            "&:hover": {
                              bgcolor: `${theme.palette.primary.main}10`,
                            },
                          }}
                        >
                          Share
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </div>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ textAlign: "center", width: "100%", mt: 4 }}
              >
                No resources found
              </Typography>
            </Grid>
          )}
        </Grid>
  
        <CreateResourceDialog
          open={createDialogOpen}
          onClose={handleDialogClose}
          existingResource={editingResource}
          onCreateResource={handleCreateResource}
          onUpdateResource={handleUpdateResource}
          board_id={selectedBoard}
          club_id={selectedClub}
          defaultBoardId={
            defaultContext?.type === "board" ? defaultContext.id : null
          }
          defaultClubId={
            defaultContext?.type === "club" ? defaultContext.id : null
          }
          userId={userId}
        />
  
        {canCreateResources() && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => {
              setEditingResource(null);
              setCreateDialogOpen(true);
            }}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
              "&:hover": {
                background: "linear-gradient(90deg, #3a5fc0 0%, #7b3fe9 100%)",
                boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </Fab>
        )}
      </Box>
    );
  }