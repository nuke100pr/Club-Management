"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
  Fab,
  CircularProgress,
  Avatar,
  Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LaunchIcon from "@mui/icons-material/Launch";
import CreateResourceDialog from "../../components/opportunities/CreateResourceDialog";
import { fetchUserData } from "@/utils/auth";

// Create a custom theme with soothing blue colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#4776E6",
      light: "#6a98ff",
      dark: "#3a5fc0",
    },
    secondary: {
      main: "#8E54E9",
    },
    background: {
      default: "#f8faff",
    },
    text: {
      primary: "#2A3B4F",
      secondary: "#607080",
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
          textTransform: "none",
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
    "#1976d2", "#388e3c", "#d32f2f", "#7b1fa2", 
    "#f57c00", "#0288d1", "#512da8", "#c2185b"
  ];
  return colors[index % colors.length];
};

const StatusChip = ({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'active':
        return "#388e3c";
      case 'upcoming':
        return "#1976d2";
      case 'past':
        return "#607080";
      default:
        return "#607080";
    }
  };

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: `${getStatusColor()}20`,
        color: getStatusColor(),
        fontWeight: 500,
        fontSize: "0.7rem",
        height: 24,
        borderRadius: 12,
      }}
    />
  );
};

// Opportunity Card Component
const OpportunityCard = ({ 
  opportunity, 
  hasPermission,
  handleEdit,
  handleDelete,
  router
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
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
          height: 320,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: isHovered 
            ? '0 12px 20px rgba(95, 150, 230, 0.2)'
            : '0 4px 12px rgba(95, 150, 230, 0.1)',
          transition: 'all 0.3s ease-in-out',
          border: `1px solid ${isHovered ? 'rgba(95, 150, 230, 0.3)' : 'transparent'}`,
          cursor: 'pointer'
        }}
        onClick={() => router.push(`/current_opportunity/${opportunity._id}`)}
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
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(opportunity._id);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(opportunity._id);
              }}
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
          <Box mb={1.5} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                transition: 'color 0.3s ease',
                color: isHovered ? '#4776E6' : '#2A3B4F',
                flex: 1,
                mr: 1
              }}
            >
              {opportunity.title}
            </Typography>
            {opportunity.status && (
              <StatusChip status={opportunity.status} />
            )}
          </Box>

          <Typography 
            variant="body2" 
            sx={{ 
              color: '#607080',
              flexGrow: 1,
              overflow: 'hidden',
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {opportunity.description}
          </Typography>
          
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', color: '#607080' }}>
            <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: '#4776E6' }} />
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {formatDate(opportunity.start_date)}
            </Typography>
          </Box>

          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', color: '#607080' }}>
            <EventAvailableIcon sx={{ fontSize: 16, mr: 1, color: '#4776E6' }} />
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {formatDate(opportunity.end_date)}
            </Typography>
          </Box>

          {opportunity.tags && opportunity.tags.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {opportunity.tags.slice(0, 3).map((tag, index) => (
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
              {opportunity.tags.length > 3 && (
                <Chip
                  label={`+${opportunity.tags.length - 3}`}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(95, 150, 230, 0.1)',
                    color: '#607080',
                    fontSize: '0.65rem',
                    height: 22,
                  }}
                />
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
            <Button
              variant="contained"
              endIcon={<LaunchIcon />}
              onClick={(e) => {
                e.stopPropagation();
                window.open(opportunity.external_link, "_blank");
              }}
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
              Apply
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function OpportunitiesPage({ boardId = null }) {
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithOpportunityPermission, setUserClubsWithOpportunityPermission] = useState([]);
  const [userBoardsWithOpportunityPermission, setUserBoardsWithOpportunityPermission] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(boardId);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
            (clubId) => result.userData.data.clubs[clubId].opportunities === true
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
            (boardId) => result.userData.data.boards[boardId].opportunities === true
          );
          setUserBoardsWithOpportunityPermission(boardsWithPermission);
          if (boardsWithPermission.length > 0 && !boardId) {
            setSelectedBoard(boardsWithPermission[0]);
          }
        }
      }
    }
    loadUserData();
  }, [boardId]);

  const hasOpportunityPermission = (opportunity) => {
    if (isSuperAdmin) return true;

    if (opportunity.club_id) {
      const clubId = opportunity.club_id._id || opportunity.club_id;
      if (userClubsWithOpportunityPermission.includes(clubId)) {
        return true;
      }
    }

    if (opportunity.board_id) {
      const boardId = opportunity.board_id._id || opportunity.board_id;
      if (userBoardsWithOpportunityPermission.includes(boardId)) {
        return true;
      }
    }

    return false;
  };

  const canCreateOpportunities = () => {
    if (boardId) {
      if (userBoardsWithOpportunityPermission.includes(boardId)) {
        return true;
      }
      return isSuperAdmin;
    }
    return (
      isSuperAdmin ||
      userClubsWithOpportunityPermission.length > 0 ||
      userBoardsWithOpportunityPermission.length > 0
    );
  };

  const getDefaultClubOrBoardId = () => {
    if (boardId) {
      return {
        type: "board",
        id: boardId,
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
        let url = "http://localhost:5000/opportunities";
        if (boardId) {
          url += `?board_id=${boardId}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch opportunities");
        }

        const data = await response.json();
        setAllOpportunities(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching opportunities:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [boardId]);

  useEffect(() => {
    let result = allOpportunities;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (opportunity) =>
          opportunity.title?.toLowerCase().includes(search) ||
          opportunity.description?.toLowerCase().includes(search) ||
          (opportunity.tags && opportunity.tags.some((keyword) =>
            keyword.toLowerCase().includes(search)
          ))
      );
    }

    if (selectedKeywords.length > 0) {
      result = result.filter((opportunity) =>
        opportunity.tags && opportunity.tags.some((keyword) => selectedKeywords.includes(keyword))
      );
    }

    setFilteredOpportunities(result);
  }, [searchTerm, allOpportunities, selectedKeywords]);

  const fetchOpportunityDetails = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/opportunities/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
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
        const response = await fetch(
          `http://localhost:5000/opportunities/${opportunityId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete opportunity");
        }

        setAllOpportunities(allOpportunities.filter((opp) => opp._id !== opportunityId));
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

  const handleFilterReset = () => {
    setSelectedKeywords([]);
    setFilterActive(false);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditingOpportunity(null);
  };

  const defaultContext = getDefaultClubOrBoardId();
  const allKeywords = [...new Set(allOpportunities.flatMap((opportunity) => opportunity.tags || []))];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8faff",
        }}
      >
        <CircularProgress
          sx={{
            color: "#4776E6",
          }}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8faff",
          flexDirection: "column",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: "#d32f2f",
            fontWeight: 600,
          }}
        >
          Something went wrong
        </Typography>
        <Typography variant="body1" color="#607080">
          {error}
        </Typography>
        <Button
          variant="outlined"
          sx={{
            mt: 3,
            color: "#4776E6",
            borderColor: "#4776E6",
            "&:hover": {
              borderColor: "#3a5fc0",
              backgroundColor: "rgba(71, 118, 230, 0.04)",
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <title>Opportunities | Your Platform</title>
        <meta name="description" content="Browse available opportunities" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Left sidebar with sticky search (25% width) */}
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
            Opportunities
          </Typography>
          
          <TextField
            fullWidth
            placeholder="Search opportunities..."
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
              Found {filteredOpportunities.length} opportunities
            </Typography>
          </Box>

          {/* Keywords/Tags Filter */}
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

        {/* Right content with opportunity cards (70% width) */}
        <Box
          sx={{
            width: '70%',
            p: 4,
            bgcolor: 'white',
            overflowY: 'auto'
          }}
        >
          <Grid container spacing={3}>
            {filteredOpportunities.length > 0 ? (
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
              <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
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
      </Box>

      <CreateResourceDialog
        open={createDialogOpen}
        handleClose={handleDialogClose}
        onSuccess={handleCreateOpportunity}
        initialData={editingOpportunity}
        boardId={selectedBoard}
        clubId={selectedClub}
        creatorId={userId}
      />

      {canCreateOpportunities() && (
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
            setEditingOpportunity(null);
            setCreateDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </ThemeProvider>
  );
}