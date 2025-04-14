"use client";
import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Button, Chip, IconButton, Tooltip, Fab } from "@mui/material";
import { Share as ShareIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import SearchAndFilterBar from "../../components/resources/SearchAndFilterBar";
import CreateResourceDialog from "../../components/resources/CreateResourceDialog";
import UniversalShareMenu from "../../components/shared/UniversalShareMenu";
import { fetchUserData } from "@/utils/auth";

// Modern color palette based on design system
const COLORS = {
  primary: "#4776E6",
  secondary: "#8E54E9",
  background: "#f8faff",
  cardBg: "#ffffff",
  textPrimary: "#2A3B4F",
  textSecondary: "#607080",
};

// Tag color palette with more vibrant colors matching design system
const getTagColor = (index) => {
  const colors = [
    "#4776E6", "#8E54E9", "#1976d2", "#388e3c", 
    "#d32f2f", "#7b1fa2", "#f57c00", "#455a64"
  ];
  return colors[index % colors.length];
};

const ResourceCards = () => {
  const [userNames, setUserNames] = useState({});
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
  const [userClubsWithResourcePermission, setUserClubsWithResourcePermission] = useState([]);
  const [userBoardsWithResourcePermission, setUserBoardsWithResourcePermission] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  // State for share menu
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [currentSharedResource, setCurrentSharedResource] = useState(null);

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        if (result.userData?.data?.clubs) {
          const clubsWithPermission = Object.keys(result.userData.data.clubs)
            .filter(clubId => result.userData.data.clubs[clubId].resources === true);
          setUserClubsWithResourcePermission(clubsWithPermission);
        }

        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(result.userData.data.boards)
            .filter(boardId => result.userData.data.boards[boardId].resources === true);
          setUserBoardsWithResourcePermission(boardsWithPermission);
        }
      }
    }
    loadUserData();
  }, []);
  const fetchUserNameById = async (userId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/details`);
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data.name || "Unknown User";
      }
      return "Unknown User";
    } catch (error) {
      console.error("Error fetching user details:", error);
      return "Unknown User";
    }
  };
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
    return isSuperAdmin || 
           userClubsWithResourcePermission.length > 0 || 
           userBoardsWithResourcePermission.length > 0;
  };

  const getDefaultClubOrBoardId = () => {
    if (userClubsWithResourcePermission.length > 0) {
      return {
        type: "club",
        id: userClubsWithResourcePermission[0]
      };
    }
    if (userBoardsWithResourcePermission.length > 0) {
      return {
        type: "board",
        id: userBoardsWithResourcePermission[0]
      };
    }
    return null;
  };

  const allKeywords = [...new Set(allResources.flatMap(resource => resource.tags || []))];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resources/api/resource`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const formattedResources = result.data.map(resource => ({
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

          setAllResources(formattedResources);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, []);
  

  useEffect(() => {
    let result = allResources;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(resource => 
        resource.title.toLowerCase().includes(search) ||
        resource.description.toLowerCase().includes(search) ||
        resource.keywords.some(keyword => keyword.toLowerCase().includes(search))
      );
    }

    if (selectedKeywords.length > 0) {
      result = result.filter(resource => 
        resource.keywords.some(keyword => selectedKeywords.includes(keyword))
      );
    }

    setFilteredResources(result);
  }, [searchTerm, allResources, selectedKeywords]);
  useEffect(() => {
    const fetchUserNames = async () => {
      const namePromises = allResources.map(async (resource) => {
        // Only fetch if we don't already have this user's name and userId is not "Unknown"
        if (!userNames[resource.publishedBy] && resource.publishedBy !== "Unknown") {
          const name = await fetchUserNameById(resource.publishedBy);
          return { id: resource.publishedBy, name };
        }
        return null;
      });
      
      const results = await Promise.all(namePromises);
      const newUserNames = { ...userNames };
      
      results.forEach(result => {
        if (result) {
          newUserNames[result.id] = result.name;
        }
      });
      
      setUserNames(newUserNames);
    };
    
    fetchUserNames();
  }, [allResources]);

  // Handle opening the share menu
  const handleShareClick = (event, resource) => {
    setShareMenuAnchor(event.currentTarget);
    setCurrentSharedResource(resource);
  };

  // Handle closing the share menu
  const handleShareClose = () => {
    setShareMenuAnchor(null);
    setCurrentSharedResource(null);
  };

  const handleEdit = async (resourceId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resources/bpi/${resourceId}`);
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
          board_id: result.data.board_id || null
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resources/bpi/${resourceId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setAllResources(prev => prev.filter(r => r.id !== resourceId));
        alert('Resource deleted successfully!');
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const handleCreateResource = (newResource) => {
    setAllResources(prev => [...prev, newResource]);
    setCreateDialogOpen(false);
  };

  const handleUpdateResource = (updatedResource) => {
    setAllResources(prev => 
      prev.map(r => r.id === updatedResource.id ? updatedResource : r)
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

  const defaultContext = getDefaultClubOrBoardId();

  return (
    <Box sx={{ 
      backgroundColor: COLORS.background, 
      minHeight: "100vh",
      padding: "32px"
    }}>


      <SearchAndFilterBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        allKeywords={allKeywords}
        selectedKeywords={selectedKeywords}
        setSelectedKeywords={setSelectedKeywords}
        filterActive={filterActive}
        setFilterActive={setFilterActive}
        handleFilterReset={handleFilterReset}
      />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: 0 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <Box
                key={resource.id}
                sx={{
                  backgroundColor: COLORS.cardBg,
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  border: "1px solid rgba(95, 150, 230, 0.1)",
                  "&:hover": {
                    boxShadow: "0 12px 20px rgba(95, 150, 230, 0.2)",
                    transform: "translateY(-8px)",
                  },
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {hasResourcePermission(resource) && (
                  <Box sx={{ 
                    position: "absolute", 
                    top: "12px", 
                    right: "12px", 
                    display: "flex",
                    gap: 1
                  }}>
                    <IconButton
                      onClick={() => handleEdit(resource.id)}
                      sx={{
                        backgroundColor: "rgba(71, 118, 230, 0.1)",
                        width: "32px",
                        height: "32px",
                        "&:hover": {
                          backgroundColor: "rgba(71, 118, 230, 0.2)",
                        }
                      }}
                    >
                      <EditIcon sx={{ fontSize: "16px", color: COLORS.primary }} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(resource.id)}
                      sx={{
                        backgroundColor: "rgba(211, 47, 47, 0.1)",
                        width: "32px",
                        height: "32px",
                        "&:hover": {
                          backgroundColor: "rgba(211, 47, 47, 0.2)",
                        }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: "16px", color: "#d32f2f" }} />
                    </IconButton>
                  </Box>
                )}

                <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                      mb: 2,
                      mt: 3
                    }}
                  >
                    {resource.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: COLORS.textSecondary,
                      mb: 2,
                      lineHeight: 1.6,
                      flex: 1
                    }}
                  >
                    {resource.description}
                  </Typography>

                  {resource.tags && resource.tags.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                      {resource.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            backgroundColor: `${getTagColor(index)}20`,
                            color: getTagColor(index),
                            borderRadius: "8px",
                            height: "22px",
                            fontSize: "0.65rem",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => window.open(resource.url, "_blank")}
                      sx={{
                        background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
                        color: "white",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        textTransform: "none",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        boxShadow: "0 2px 6px rgba(71, 118, 230, 0.3)",
                        "&:hover": {
                          boxShadow: "0 4px 10px rgba(71, 118, 230, 0.4)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease"
                      }}
                    >
                      View Resource
                    </Button>

                    <Tooltip title="Share resource">
                      <IconButton 
                        onClick={(e) => handleShareClick(e, resource)}
                        sx={{
                          color: COLORS.primary,
                          "&:hover": {
                            backgroundColor: "rgba(71, 118, 230, 0.1)",
                          }
                        }}
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box 
                  sx={{ 
                    p: 2,
                    borderTop: "1px solid rgba(95, 150, 230, 0.1)",
                    backgroundColor: "rgba(95, 150, 230, 0.03)",
                    display: "flex",
                    justifyContent: "space-between"
                  }}
                >
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    By: {userNames[resource.publishedBy] || resource.publishedBy}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    {new Date(resource.publishedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Box 
              sx={{ 
                gridColumn: "1 / -1", 
                textAlign: "center", 
                backgroundColor: "white",
                borderRadius: "16px",
                padding: 4,
                boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: COLORS.textSecondary,
                  fontWeight: 500
                }}
              >
                No resources found
              </Typography>
            </Box>
          )}
        </Box>
      </Container>

      {/* Universal Share Menu Component */}
      {currentSharedResource && (
        <UniversalShareMenu
          anchorEl={shareMenuAnchor}
          open={Boolean(shareMenuAnchor)}
          onClose={handleShareClose}
          id={currentSharedResource.id}
          title={currentSharedResource.title}
          url={currentSharedResource.url}
          contentType="resource"
          customShareText={`Check out this resource: ${currentSharedResource.title}`}
        />
      )}

      <CreateResourceDialog 
        open={createDialogOpen}
        onClose={handleDialogClose}
        existingResource={editingResource}
        onCreateResource={handleCreateResource}
        onUpdateResource={handleUpdateResource}
        board_id={selectedBoard}
        club_id={selectedClub}
        defaultBoardId={defaultContext?.type === 'board' ? defaultContext.id : null}
        defaultClubId={defaultContext?.type === 'club' ? defaultContext.id : null}
        userId={userId}
      />
    </Box>
  );
};

export default ResourceCards;