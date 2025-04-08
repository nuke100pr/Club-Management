"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Box,
  IconButton,
  Paper,
  Fab,
  TextField,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Add as AddIcon } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CreateResourceDialog from "../../components/opportunities/CreateResourceDialog";
import { fetchUserData } from "@/utils/auth";

const getTagColor = (index) => {
  const colors = [
    "#1976d2", "#2196f3", "#009688", "#4caf50", 
    "#ff9800", "#f44336", "#9c27b0",
  ];
  return colors[index % colors.length];
};

const filters = ["My Clubs", "My Boards", "Active", "Upcoming", "Past"];

const OPPORTUNITIES = ({boardId}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithOpportunityPermission, setUserClubsWithOpportunityPermission] = useState([]);
  const [userBoardsWithOpportunityPermission, setUserBoardsWithOpportunityPermission] = useState([]);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [currentClubId, setCurrentClubId] = useState(null);
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
            setCurrentClubId(clubsWithPermission[0]);
          }
        }

        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData.data.boards
          ).filter(
            (boardId) => result.userData.data.boards[boardId].opportunities === true
          );
          setUserBoardsWithOpportunityPermission(boardsWithPermission);
          if (boardsWithPermission.length > 0) {
            setCurrentBoardId(boardsWithPermission[0]);
          }
        }
      }
    }
    loadUserData();
  }, []);

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
    return (
      isSuperAdmin ||
      userClubsWithOpportunityPermission.length > 0 ||
      userBoardsWithOpportunityPermission.length > 0
    );
  };

  const allKeywords = Array.from(
    new Set(opportunities.flatMap((opportunity) => opportunity.tags || []))
  );

  const fetchOpportunities = async () => {
    try {
      const response = await fetch("http://localhost:5000/opportunities", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }

      const data = await response.json();
      setOpportunities(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching opportunities:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

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
      setOpenCreateDialog(true);
    } catch (err) {
      console.error("Error fetching opportunity details:", err);
    }
  };

  const handleEdit = (opportunity) => {
    fetchOpportunityDetails(opportunity._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this opportunity?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/opportunities/${id}`,
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

        setOpportunities(opportunities.filter((opp) => opp._id !== id));
      } catch (err) {
        console.error("Error deleting opportunity:", err);
      }
    }
  };

  const handleCreate = () => {
    setEditingOpportunity(null);
    setOpenCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    setEditingOpportunity(null);
  };

  const handleOpportunityCreated = (newOpportunity) => {
    if (editingOpportunity) {
      setOpportunities(
        opportunities.map((opp) =>
          opp._id === newOpportunity._id ? newOpportunity : opp
        )
      );
    } else {
      setOpportunities([...opportunities, newOpportunity]);
    }
    setOpenCreateDialog(false);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setSelectedKeywords([]);
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      opportunity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const hasActiveFilters = Object.values(selectedFilters).some(Boolean);

    if (!hasActiveFilters && selectedKeywords.length === 0) {
      return matchesSearch;
    }

    const matchesRegisteredFilter = selectedFilters["My Registered Events"]
      ? opportunity.registered
      : true;
    const matchesClubFilter = selectedFilters["My Clubs"]
      ? opportunity.isClubFollowed
      : true;
    const matchesBoardFilter = selectedFilters["My Boards"]
      ? opportunity.isBoardFollowed
      : true;

    const matchesTags =
      selectedKeywords.length === 0 ||
      opportunity.tags?.some((tag) => selectedKeywords.includes(tag));

    return (
      matchesSearch &&
      matchesRegisteredFilter &&
      matchesClubFilter &&
      matchesBoardFilter &&
      matchesTags
    );
  });

  if (loading) {
    return (
      <Container>
        <Typography variant="body1">Loading opportunities...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="body1" color="error">
          Error: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(to bottom, rgba(245,247,250,0.8), rgba(255,255,255,1))",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          position: "relative",
          minHeight: "80vh",
          backgroundColor: "transparent",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 3,
                position: "sticky",
                top: 80,
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow:
                  "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px",
                },
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                label="Search Opportunities"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box
                      component="span"
                      sx={{ mr: 1, color: "text.secondary" }}
                    >
                      <SearchIcon fontSize="small" />
                    </Box>
                  ),
                  sx: {
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                    "&:hover": {
                      backgroundColor: "background.paper",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                  },
                }}
              />

              {!boardId && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: "text.primary",
                    }}
                  >
                    Filters
                  </Typography>
                  {filters.map((filter) => (
                    <Box key={filter} sx={{ mt: 1 }}>
                      <Chip
                        label={filter}
                        clickable
                        color={selectedFilters[filter] ? "primary" : "default"}
                        onClick={() => handleFilterChange(filter)}
                        sx={{
                          mr: 1,
                          mb: 1,
                          borderRadius: "8px",
                          fontWeight: 500,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                          },
                        }}
                      />
                    </Box>
                  ))}
                  {Object.values(selectedFilters).some(Boolean) && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={clearFilters}
                      sx={{
                        mt: 2,
                        color: "primary.main",
                        fontWeight: 500,
                        "&:hover": {
                          backgroundColor: "rgba(33, 150, 243, 0.08)",
                        },
                      }}
                      startIcon={<ClearIcon fontSize="small" />}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} sm={9}>
            <Grid container spacing={3} justifyContent="center">
              {filteredOpportunities.length > 0 ? (
                filteredOpportunities.map((opportunity) => (
                  <Grid item key={opportunity._id} xs={12} sm={6} md={4}>
                    <Card elevation={3} sx={{ p: 2, borderRadius: 3 }}       onClick={(e) => {
        // Add this click handler
        if (e.target.closest('button, a, [role="button"]')) return;
        router.push(`/current_opportunity/${opportunity._id}`);
      }}>
                      {opportunity.image && (
                        <Box
                          sx={{
                            height: 200,
                            width: "100%",
                            overflow: "hidden",
                            borderRadius: 2,
                            marginBottom: 2,
                          }}
                        >
                          <img
                            src={opportunity.image}
                            alt={opportunity.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      )}
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="h6">{opportunity.title}</Typography>
                          {hasOpportunityPermission(opportunity) && (
                            <Box>
                              <IconButton onClick={() => handleEdit(opportunity)} color="primary">
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDelete(opportunity._id)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {opportunity.description}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Start:</strong> {opportunity.start_date}
                        </Typography>
                        <Typography variant="body2">
                          <strong>End:</strong> {opportunity.end_date}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Status:</strong> {opportunity.status?.toUpperCase()}
                        </Typography>

                        {opportunity.tags && opportunity.tags.length > 0 && (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                            {opportunity.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                sx={{ backgroundColor: getTagColor(index), color: "white" }}
                              />
                            ))}
                          </Box>
                        )}

                        <Button
                          variant="contained"
                          color="primary"
                          href={opportunity.external_link}
                          target="_blank"
                          sx={{ mt: 2, width: "100%" }}
                        >
                          Apply Now
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: "center" }}>
                    {loading ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                        }}
                      >
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          Loading opportunities...
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No opportunities matching your search criteria
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>

        {canCreateOpportunities() && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleCreate}
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              boxShadow: "0 8px 16px rgba(33, 150, 243, 0.3)",
              "&:hover": {
                transform: "scale(1.1)",
                boxShadow: "0 12px 20px rgba(33, 150, 243, 0.4)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <AddIcon />
          </Fab>
        )}

        <CreateResourceDialog
          open={openCreateDialog}
          handleClose={handleCloseDialog}
          onSuccess={handleOpportunityCreated}
          initialData={editingOpportunity}
          boardId={boardId}
          clubId={currentClubId}
          creatorId={userId}
        />
      </Container>
    </Box>
  );
};

export default OPPORTUNITIES;