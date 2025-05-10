"use client";
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Card, 
  CardContent, 
  Chip, 
  Button, 
  IconButton,
  Tooltip,
  Grid,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Fab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchUserData, getAuthToken } from '@/utils/auth';
import CreateResourceDialog from '../../components/resources/CreateResourceDialog';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4776E6',
      light: '#6a98ff',
      dark: '#3a5fc0',
    },
    secondary: {
      main: '#8E54E9',
    },
    background: {
      default: '#f8faff',
    },
    text: {
      primary: '#2A3B4F',
      secondary: '#607080',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

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

const ResourceCard = ({ 
  resource, 
  hasPermission,
  handleEdit,
  handleDelete,
  shareResource
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const truncateDescription = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        sx={{
          width: '100%',
          height: 280,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: isHovered 
            ? '0 12px 20px rgba(95, 150, 230, 0.2)'
            : '0 4px 12px rgba(95, 150, 230, 0.1)',
          transition: 'all 0.3s ease-in-out',
          border: `1px solid ${isHovered ? 'rgba(95, 150, 230, 0.3)' : 'transparent'}`,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: isHovered 
              ? 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)' 
              : 'linear-gradient(90deg, #4776E6 0%, #6a98ff 100%)',
            transition: 'all 0.3s ease',
          }}
        />
        
        {hasPermission && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              display: 'flex',
              gap: 0.5
            }}
          >
            <IconButton
              onClick={() => handleEdit(resource.id)}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handleDelete(resource.id)}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box mb={1.5}>
            <Chip
              label={resource.board_id ? "Board" : resource.club_id ? "Club" : "General"}
              size="small"
              sx={{
                background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                color: 'white',
                fontWeight: 500,
                fontSize: '0.7rem',
                mb: 1.5,
                '&:hover': {
                  background: 'linear-gradient(90deg, #4776E6 20%, #8E54E9 100%)',
                }
              }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                transition: 'color 0.3s ease',
                color: isHovered ? '#4776E6' : '#2A3B4F',
              }}
            >
              {resource.title}
            </Typography>
          </Box>

          <Typography 
            variant="body2" 
            sx={{ 
              color: '#607080',
              flexGrow: 1,
              overflow: 'hidden',
              mb: 2
            }}
          >
            {truncateDescription(resource.description)}
          </Typography>
          
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
            {resource.tags && resource.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: 'rgba(95, 150, 230, 0.1)',
                  color: getTagColor(index),
                  fontSize: '0.65rem',
                  height: 22,
                  '&:hover': {
                    backgroundColor: 'rgba(95, 150, 230, 0.2)',
                  }
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={() => window.open(resource.url, "_blank")}
              sx={{
                background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
                borderRadius: 2,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(90deg, #5a83e6 0%, #9864e9 100%)',
                  boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              View Resource
            </Button>
            <Tooltip title="Share Resource">
              <IconButton
                onClick={() => shareResource(resource)}
                sx={{
                  backgroundColor: 'rgba(95, 150, 230, 0.1)',
                  color: '#4776E6',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(95, 150, 230, 0.2)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ResourcesPage({ boardId = null }) {
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
  const [selectedBoard, setSelectedBoard] = useState(boardId);
  const [selectedClub, setSelectedClub] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

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
        if(!authToken) {
          return;
        }

        let url = "http://localhost:5000/resources/api/resource";
        if (boardId) {
          url += `?board_id=${boardId}`;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        });
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
  }, [boardId, authToken]);

  useEffect(() => {
    let result = allResources;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (resource) =>
          resource.title.toLowerCase().includes(search) ||
          resource.description.toLowerCase().includes(search) ||
          (resource.tags && resource.tags.some((keyword) =>
            keyword.toLowerCase().includes(search)
          ))
      );
    }

    if (selectedKeywords.length > 0) {
      result = result.filter((resource) =>
        resource.tags && resource.tags.some((keyword) => selectedKeywords.includes(keyword))
      );
    }

    setFilteredResources(result);
  }, [searchTerm, allResources, selectedKeywords]);

  const shareResource = (resource) => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      if (navigator.share) {
        navigator
          .share({
            title: resource.title,
            text: resource.description,
            url: resource.url,
          })
          .catch((error) => console.error("Error sharing:", error));
      } else if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(resource.url)
          .then(() => alert("Link copied to clipboard: " + resource.url))
          .catch((err) => console.error("Failed to copy link: ", err));
      } else {
        alert("Sharing not supported in this browser.");
      }
    }
  };
  

  const handleEdit = async (resourceId) => {
    try {
      if(!authToken) {
        return;
      }

      const response = await fetch(
        `http://localhost:5000/resources/api/resource/${resourceId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
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
      if(!authToken) {
        return;
      }

      const response = await fetch(
        `http://localhost:5000/resources/api/resource/${resourceId}`,
        {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
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
  const allKeywords = [...new Set(allResources.flatMap((resource) => resource.tags || []))];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <title>Resources | Your Platform</title>
        <meta name="description" content="Browse our curated collection of resources" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Box
          sx={{
            width: '25%',
            bgcolor: 'rgba(245, 247, 250, 0.7)',
            p: 3,
            borderRight: '1px solid rgba(95, 150, 230, 0.1)',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          <Typography 
            variant="h5" 
            fontWeight={600} 
            mb={3} 
            sx={{ 
              background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Resources
          </Typography>
          
          <TextField
            fullWidth
            placeholder="Search resources..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(95, 150, 230, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(95, 150, 230, 0.15)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 15px rgba(95, 150, 230, 0.2)',
                }
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(95, 150, 230, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(95, 150, 230, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4776E6',
                },
              },
            }}
          />
          
          <Box mt={4}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Found {filteredResources.length} resources
            </Typography>
          </Box>

          {allKeywords.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                    sx={{
                      backgroundColor: selectedKeywords.includes(keyword)
                        ? 'rgba(71, 118, 230, 0.2)'
                        : 'rgba(95, 150, 230, 0.1)',
                      color: selectedKeywords.includes(keyword)
                        ? '#4776E6'
                        : '#607080',
                      fontSize: '0.65rem',
                      height: 22,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(95, 150, 230, 0.2)',
                      }
                    }}
                  />
                ))}
              </Box>

              {filterActive && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleFilterReset}
                  sx={{ 
                    mt: 1,
                    color: '#4776E6',
                    borderColor: 'rgba(71, 118, 230, 0.5)',
                    '&:hover': {
                      borderColor: '#4776E6',
                      backgroundColor: 'rgba(71, 118, 230, 0.05)'
                    }
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            width: '70%',
            p: 4,
            bgcolor: 'white',
            overflowY: 'auto'
          }}
        >
          <Grid container spacing={3}>
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <Grid item xs={12} sm={6} md={4} key={resource.id}>
                  <ResourceCard 
                    resource={resource}
                    hasPermission={hasResourcePermission(resource)}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    shareResource={shareResource}
                  />
                </Grid>
              ))
            ) : (
              <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No resources found matching your search.
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Try adjusting your search terms or browse all resources.
                </Typography>
              </Box>
            )}
          </Grid>
        </Box>
      </Box>

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
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
            '&:hover': {
              background: 'linear-gradient(90deg, #5a83e6 0%, #9864e9 100%)',
            }
          }}
          onClick={() => {
            setEditingResource(null);
            setCreateDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </ThemeProvider>
  );
}