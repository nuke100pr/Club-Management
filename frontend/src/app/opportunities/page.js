"use client";
import React, { useState, useEffect } from "react";
import SearchAndFilter from "../../components/opportunities/SearchAndFilter";
import CreateResourceDialog from "../../components/opportunities/CreateResourceDialog";
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  IconButton,
  Paper,
  Fab,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { fetchUserData } from "@/utils/auth";

// Function to generate tag colors
const getTagColor = (index) => {
  const colors = [
    "#1976d2", // blue
    "#2196f3", // light blue
    "#009688", // teal
    "#4caf50", // green
    "#ff9800", // orange
    "#f44336", // red
    "#9c27b0", // purple
  ];
  return colors[index % colors.length];
};

const OPPORTUNITIES = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [opportunities, setOpportunities] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
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
  const [expandedTagsMap, setExpandedTagsMap] = useState({});

  // Toggle expanded tags for a specific opportunity
  const toggleExpandedTags = (opportunityId) => {
    setExpandedTagsMap(prev => ({
      ...prev,
      [opportunityId]: !prev[opportunityId]
    }));
  };

  // Fetch user data on mount
  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        // Extract clubs with opportunities permission
        if (result.userData?.data?.clubs) {
          const clubsWithPermission = Object.keys(
            result.userData.data.clubs
          ).filter(
            (clubId) =>
              result.userData.data.clubs[clubId].opportunities === true
          );
          setUserClubsWithOpportunityPermission(clubsWithPermission);

          // Set the first club ID if available
          if (clubsWithPermission.length > 0) {
            setCurrentClubId(clubsWithPermission[0]);
          }
        }

        // Extract boards with opportunities permission
        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData.data.boards
          ).filter(
            (boardId) =>
              result.userData.data.boards[boardId].opportunities === true
          );
          setUserBoardsWithOpportunityPermission(boardsWithPermission);

          // Set the first board ID if available
          if (boardsWithPermission.length > 0) {
            setCurrentBoardId(boardsWithPermission[0]);
          }
        }
      }
    }
    loadUserData();
  }, []);

  // Check if user has permission to edit/delete an opportunity
  const hasOpportunityPermission = (opportunity) => {
    // Superadmins have all permissions
    if (isSuperAdmin) return true;

    // Check if opportunity belongs to a club where user has permission
    if (opportunity.club_id) {
      const clubId = opportunity.club_id._id || opportunity.club_id;
      if (userClubsWithOpportunityPermission.includes(clubId)) {
        return true;
      }
    }

    // Check if opportunity belongs to a board where user has permission
    if (opportunity.board_id) {
      const boardId = opportunity.board_id._id || opportunity.board_id;
      if (userBoardsWithOpportunityPermission.includes(boardId)) {
        return true;
      }
    }

    return false;
  };

  // Check if user can create opportunities
  const canCreateOpportunities = () => {
    return (
      isSuperAdmin ||
      userClubsWithOpportunityPermission.length > 0 ||
      userBoardsWithOpportunityPermission.length > 0
    );
  };

  // Extract all unique tags for filter
  const allKeywords = Array.from(
    new Set(opportunities.flatMap((opportunity) => opportunity.tags || []))
  );

  // Fetch Opportunities
  const fetchOpportunities = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/opportunities`, {
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

  // Load opportunities on mount
  useEffect(() => {
    fetchOpportunities();
  }, []);

  // Fetch Single Opportunity for Editing
  const fetchOpportunityDetails = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/opportunities/${id}`,
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

  // Update Opportunity
  const updateOpportunity = async (updatedOpportunity) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/opportunities/${updatedOpportunity._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedOpportunity),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update opportunity");
      }

      const updatedData = await response.json();
      setOpportunities(
        opportunities.map((opp) =>
          opp._id === updatedData._id ? updatedData : opp
        )
      );
      setOpenCreateDialog(false);
      setEditingOpportunity(null);
    } catch (err) {
      console.error("Error updating opportunity:", err);
    }
  };

  // Delete Opportunity
  const deleteOpportunity = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/opportunities/${id}`,
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
  };

  const handleEdit = (opportunity) => {
    fetchOpportunityDetails(opportunity._id);
  };

  const handleDelete = (id) => {
    deleteOpportunity(id);
  };

  const handleCreate = () => {
    setEditingOpportunity(null);
    setOpenCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    setEditingOpportunity(null);
  };

  const handleSubmitDialog = async (newOpportunity) => {
    if (editingOpportunity) {
      // Update existing opportunity
      await updateOpportunity(newOpportunity);
    } else {
      // Create new opportunity
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/opportunities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newOpportunity,
            board_id: currentBoardId,
            club_id: currentClubId,
            creator_id: userId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create opportunity");
        }

        const createdOpportunity = await response.json();
        setOpportunities([...opportunities, createdOpportunity]);
        setOpenCreateDialog(false);
      } catch (err) {
        console.error("Error creating opportunity:", err);
      }
    }
  };

  // Filter opportunities based on search term, category and tags
  const filteredOpportunities = opportunities.filter((opportunity) => {
    // Text search filter
    const matchesSearch =
      opportunity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory =
      categoryFilter === "all" ||
      opportunity.board_id === categoryFilter ||
      opportunity.club_id === categoryFilter;

    // Tags filter
    const matchesTags =
      selectedKeywords.length === 0 ||
      opportunity.tags?.some((tag) => selectedKeywords.includes(tag));

    return matchesSearch && matchesCategory && matchesTags;
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
    <div className="bg-[#f8faff] min-h-screen font-[Inter,sans-serif]">
      <Box>
        {/* Search and Filter Component */}
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          selectedKeywords={selectedKeywords}
          setSelectedKeywords={setSelectedKeywords}
          filterActive={filterActive}
          setFilterActive={setFilterActive}
          allKeywords={allKeywords}
        />

        {/* Content Container */}
        <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
          <Typography
            variant="h5"
            component="h1"
            fontWeight={600}
            mb={4}
            sx={{
              background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Opportunities
          </Typography>

          {/* Opportunities Grid */}
          <Grid container spacing={3}>
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((opportunity) => (
                <Grid item key={opportunity._id} xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(95, 150, 230, 0.1)',
                      transition: 'all 0.3s ease',
                      borderTop: '3px solid #4776E6',
                      '&:hover': {
                        boxShadow: '0 12px 20px rgba(95, 150, 230, 0.2)',
                        transform: 'translateY(-8px)',
                      },
                    }}
                  >
                    {/* Image */}
                    {opportunity.image && (
                      <Box sx={{ height: 200, width: '100%', overflow: 'hidden' }}>
                        <img
                          src={opportunity.image}
                          alt={opportunity.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    )}

                    <Box sx={{ p: 3 }}>
                      {/* Title and Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#2A3B4F', flexGrow: 1 }}>
                          {opportunity.title}
                        </Typography>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 5,
                            fontSize: '0.75rem',
                            ml: 1,
                            bgcolor: opportunity.status?.toLowerCase() === 'active' 
                              ? 'rgba(56,142,60,0.1)' 
                              : 'rgba(211,47,47,0.1)',
                            color: opportunity.status?.toLowerCase() === 'active' ? '#388e3c' : '#d32f2f',
                          }}
                        >
                          {opportunity.status?.toUpperCase()}
                        </Box>

                        {/* Edit/Delete Buttons for admins */}
                        {hasOpportunityPermission(opportunity) && (
                          <Box sx={{ display: 'flex', ml: 1 }}>
                            <IconButton
                              onClick={() => handleEdit(opportunity)}
                              size="small"
                              sx={{ color: '#4776E6' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(opportunity._id)}
                              size="small"
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      {/* Description */}
                      <Typography variant="body2" sx={{ color: '#607080', mb: 2 }}>
                        {opportunity.description}
                      </Typography>

                      {/* Dates */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: '#607080' }}>
                        <CalendarTodayIcon sx={{ fontSize: 16, mr: 1 }} />
                        <Typography variant="body2">
                          {opportunity.start_date} - {opportunity.end_date}
                        </Typography>
                      </Box>

                      {/* Tags */}
                      {opportunity.tags && opportunity.tags.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(expandedTagsMap[opportunity._id] 
                              ? opportunity.tags 
                              : opportunity.tags.slice(0, 3)
                            ).map((tag, index) => (
                              <Box
                                key={index}
                                sx={{
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 5,
                                  fontSize: '0.65rem',
                                  height: '22px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  bgcolor: 'rgba(95, 150, 230, 0.1)',
                                  color: getTagColor(index),
                                }}
                              >
                                {tag}
                              </Box>
                            ))}
                            
                            {opportunity.tags.length > 3 && !expandedTagsMap[opportunity._id] && (
                              <Box 
                                onClick={() => toggleExpandedTags(opportunity._id)}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#4776E6',
                                  cursor: 'pointer',
                                  fontSize: '0.7rem',
                                }}
                              >
                                <AddIcon sx={{ fontSize: 14 }} />
                                {opportunity.tags.length - 3}
                              </Box>
                            )}
                            
                            {expandedTagsMap[opportunity._id] && (
                              <Box 
                                onClick={() => toggleExpandedTags(opportunity._id)}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#4776E6',
                                  cursor: 'pointer',
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 14 }} />
                              </Box>
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* Apply Button */}
                      <Button
                        variant="contained"
                        fullWidth
                        href={opportunity.external_link}
                        target="_blank"
                        sx={{
                          background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                          color: 'white',
                          fontWeight: 500,
                          py: 1,
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
                          '&:hover': {
                            boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Apply Now
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: 4,
                    boxShadow: '0 4px 12px rgba(95, 150, 230, 0.1)',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No opportunities matching your search criteria
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>

        {/* Add Opportunity FAB */}
        {canCreateOpportunities() && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleCreate}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
              },
            }}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Create/Edit Opportunity Dialog Component */}
        <CreateResourceDialog
          open={openCreateDialog}
          handleClose={handleCloseDialog}
          handleSubmit={handleSubmitDialog}
          initialData={editingOpportunity}
          boardId={currentBoardId}
          clubId={currentClubId}
          creatorId={userId}
        />
      </Box>
    </div>
  );
};

export default OPPORTUNITIES;