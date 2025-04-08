"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Fab,
  Paper,
  TextField,
} from "@mui/material";
import { Share as ShareIcon, Add as AddIcon } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchUserData } from "@/utils/auth";
import CreateResourceDialog from "../../components/resources/CreateResourceDialog";

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

const ResourceCards = ({ clubId = null }) => {
  const [allResources, setAllResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
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
  const [selectedBoard, setSelectedBoard] = useState(clubId);
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
            (clubId) => result.userData.data.boards[clubId].resources === true
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

    if (resource.club_id) {
      const clubId = resource.club_id._id || resource.club_id;
      if (userBoardsWithResourcePermission.includes(clubId)) {
        return true;
      }
    }

    return false;
  };

  const canCreateResources = () => {
    if (clubId) {
      return isSuperAdmin || userBoardsWithResourcePermission.includes(clubId);
    }
    return (
      isSuperAdmin ||
      userClubsWithResourcePermission.length > 0 ||
      userBoardsWithResourcePermission.length > 0
    );
  };

  const getDefaultClubOrclubId = () => {
    if (clubId) {
      return {
        type: "board",
        id: clubId,
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

  const allKeywords = [
    ...new Set(allResources.flatMap((resource) => resource.tags || [])),
  ];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        let url = "http://localhost:5000/resources/api/resource";
        if (clubId) {
          url += `?club_id=${clubId}`;
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
            club_id: resource.club_id || null,
          }));

          setAllResources(formattedResources);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, [clubId]);

  useEffect(() => {
    let result = allResources;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (resource) =>
          resource.title.toLowerCase().includes(search) ||
          resource.description.toLowerCase().includes(search) ||
          resource.keywords.some((keyword) =>
            keyword.toLowerCase().includes(search)
          )
      );
    }

    if (selectedKeywords.length > 0) {
      result = result.filter((resource) =>
        resource.keywords.some((keyword) => selectedKeywords.includes(keyword))
      );
    }

    setFilteredResources(result);
  }, [searchTerm, allResources, selectedKeywords]);

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
          club_id: result.data.club_id || null,
        };

        setEditingResource(editResource);
        setCreateDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching resource details:", error);
    }
  };

  const handleDelete = async (resourceId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/resources/api/resource/${resourceId}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();

      if (result.success) {
        setAllResources((prev) => prev.filter((r) => r.id !== resourceId));
        alert("Resource deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
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

  const handleFilterReset = () => {
    setSelectedKeywords([]);
    setFilterActive(false);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditingResource(null);
  };

  const defaultContext = getDefaultClubOrclubId();

  return (
    <Box>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Panel - Search Bar (Fixed, Non-Scrollable) */}
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 2,
                position: "sticky",
                top: 80,
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: 3,
                borderRadius: 2,
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                label="Search Resources"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Keywords/Tags Filter */}
              {allKeywords.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Keywords
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {allKeywords.map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        size="small"
                        onClick={() => {
                          if (selectedKeywords.includes(keyword)) {
                            setSelectedKeywords(
                              selectedKeywords.filter((k) => k !== keyword)
                            );
                          } else {
                            setSelectedKeywords([...selectedKeywords, keyword]);
                            setFilterActive(true);
                          }
                        }}
                        color={
                          selectedKeywords.includes(keyword)
                            ? "primary"
                            : "default"
                        }
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>

                  {filterActive && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleFilterReset}
                      sx={{ mt: 1 }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Panel - Resource Cards */}
          <Grid item xs={12} sm={9}>
            <Grid container spacing={3}>
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <Grid item key={resource.id} xs={12} sm={6} md={6} lg={4}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                      }}
                    >
                      {hasResourcePermission(resource) && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 1,
                          }}
                        >
                          <IconButton
                            onClick={() => handleEdit(resource.id)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(resource.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}

                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" component="h3" gutterBottom>
                          {resource.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          {resource.description}
                        </Typography>

                        {resource.tags && resource.tags.length > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              mt: 2,
                            }}
                          >
                            {resource.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                sx={{
                                  backgroundColor: getTagColor(index),
                                  color: "white",
                                }}
                              />
                            ))}
                          </Box>
                        )}

                        <Typography variant="body2" color="text.secondary">
                          Published by: {resource.publishedBy}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Published at:{" "}
                          {new Date(resource.publishedAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>

                      <Box
                        sx={{
                          p: 2,
                          pt: 0,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => window.open(resource.url, "_blank")}
                        >
                          View Resource
                        </Button>

                        <Box display="flex" alignItems="center">
                          <Tooltip title="Share resource">
                            <IconButton
                              onClick={() => shareResource(resource)}
                              color="primary"
                            >
                              <ShareIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Card>
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
          </Grid>
        </Grid>
      </Container>

      <CreateResourceDialog
        open={createDialogOpen}
        onClose={handleDialogClose}
        existingResource={editingResource}
        onCreateResource={handleCreateResource}
        onUpdateResource={handleUpdateResource}
        club_id={selectedBoard}
        club_id={selectedClub}
        defaultclubId={
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
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={() => {
            setEditingResource(null);
            setCreateDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default ResourceCards;
