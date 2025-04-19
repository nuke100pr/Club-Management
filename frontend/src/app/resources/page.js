"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Fab,
  useTheme,
} from "@mui/material";
import {
  Share as ShareIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import SearchAndFilterBar from "../../components/resources/SearchAndFilterBar";
import CreateResourceDialog from "../../components/resources/CreateResourceDialog";
import UniversalShareMenu from "../../components/shared/UniversalShareMenu";
import { fetchUserData, hasPermission } from "@/utils/auth";

const getTagColor = (index, theme) => {
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.primary.dark,
    theme.palette.secondary.dark,
  ];
  return colors[index % colors.length];
};

const ResourceCards = () => {
  const theme = useTheme();
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
  
  const [arrayPermissions, setArrayPermissions] = useState({});

  const [userClubsWithResourcePermission, setUserClubsWithResourcePermission] =
    useState([]);
  const [
    userBoardsWithResourcePermission,
    setUserBoardsWithResourcePermission,
  ] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [currentSharedResource, setCurrentSharedResource] = useState(null);


  useEffect(() => {
    // Check permissions for all resources
    if (userData && filteredResources.length > 0) {
      filteredResources.forEach(async (resource) => {
        const clubId = resource.club_id?._id || resource.club_id;
        const boardId = resource.board_id?._id || resource.board_id;
        
        // If you must use the async version of hasPermission
        const hasAccess = await hasPermission("resources", userData, boardId, clubId);
        
        setArrayPermissions(prev => ({
          ...prev,
          [resource.id]: hasAccess
        }));
      });
    }
  }, [userData, filteredResources]);


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

  const fetchUserNameById = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/details`
      );
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

  const hasResourcePermission = async (resource) => {
    if (isSuperAdmin) return true;
    if (!userData) return false;

    const clubId = resource.club_id?._id || resource.club_id;
    const boardId = resource.board_id?._id || resource.board_id;

    const vt = await hasPermission("resources", userData, boardId, clubId);
    console.log(vt);
    return vt;
  };

  const getDefaultClubOrBoardId = () => {
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/resources/api/resource`
        );
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

  useEffect(() => {
    const fetchUserNames = async () => {
      const namePromises = allResources.map(async (resource) => {
        if (
          !userNames[resource.publishedBy] &&
          resource.publishedBy !== "Unknown"
        ) {
          const name = await fetchUserNameById(resource.publishedBy);
          return { id: resource.publishedBy, name };
        }
        return null;
      });
      const results = await Promise.all(namePromises);
      const newUserNames = { ...userNames };
      results.forEach((result) => {
        if (result) {
          newUserNames[result.id] = result.name;
        }
      });
      setUserNames(newUserNames);
    };
    fetchUserNames();
  }, [allResources]);

  const handleShareClick = (event, resource) => {
    setShareMenuAnchor(event.currentTarget);
    setCurrentSharedResource(resource);
  };

  const handleShareClose = () => {
    setShareMenuAnchor(null);
    setCurrentSharedResource(null);
  };

  const handleEdit = async (resourceId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resources/bpi/${resourceId}`
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
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resources/bpi/${resourceId}`,
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

  const defaultContext = getDefaultClubOrBoardId();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: "32px",
        backgroundColor: theme.palette.background.default,
      }}
    >
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
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: theme.shadows[2],
                  transition: "all 0.3s ease",
                  position: "relative",
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    boxShadow: theme.shadows[6],
                    transform: "translateY(-8px)",
                  },
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {arrayPermissions[resource.id] === true && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      onClick={() => handleEdit(resource.id)}
                      sx={{
                        backgroundColor: theme.palette.primary.light,
                        width: "32px",
                        height: "32px",
                        "&:hover": {
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                        },
                      }}
                    >
                      <EditIcon sx={{ fontSize: "16px" }} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(resource.id)}
                      sx={{
                        backgroundColor: theme.palette.error.light,
                        width: "32px",
                        height: "32px",
                        "&:hover": {
                          backgroundColor: theme.palette.error.main,
                          color: theme.palette.error.contrastText,
                        },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: "16px" }} />
                    </IconButton>
                  </Box>
                )}

                <Box
                  sx={{
                    p: 3,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 2,
                      mt: 3,
                    }}
                  >
                    {resource.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 2,
                      lineHeight: 1.6,
                      flex: 1,
                    }}
                  >
                    {resource.description}
                  </Typography>

                  {resource.tags && resource.tags.length > 0 && (
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                    >
                      {resource.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            backgroundColor: `${getTagColor(index, theme)}20`,
                            color: getTagColor(index, theme),
                            borderRadius: "8px",
                            height: "22px",
                            fontSize: "0.65rem",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => window.open(resource.url, "_blank")}
                      sx={{
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: theme.palette.primary.contrastText,
                        borderRadius: "8px",
                        padding: "6px 12px",
                        textTransform: "none",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        boxShadow: theme.shadows[2],
                        "&:hover": {
                          boxShadow: theme.shadows[4],
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      View Resource
                    </Button>

                    <Tooltip title="Share resource">
                      <IconButton
                        onClick={(e) => handleShareClick(e, resource)}
                        sx={{
                          color: theme.palette.primary.main,
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
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
                    borderTop: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.action.hover,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    By:{" "}
                    {userNames[resource.publishedBy] || resource.publishedBy}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
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
                backgroundColor: theme.palette.background.paper,
                borderRadius: "16px",
                padding: 4,
                boxShadow: theme.shadows[2],
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                }}
              >
                No resources found
              </Typography>
            </Box>
          )}
        </Box>
      </Container>

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
        defaultBoardId={
          defaultContext?.type === "board" ? defaultContext.id : null
        }
        defaultClubId={
          defaultContext?.type === "club" ? defaultContext.id : null
        }
        userId={userId}
      />
    </Box>
  );
};

export default ResourceCards;
