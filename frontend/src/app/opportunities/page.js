"use client";
import React, { useState, useEffect } from "react";
import SearchAndFilter from "../../components/opportunities/SearchAndFilter";
import CreateResourceDialog from "../../components/opportunities/CreateResourceDialog";
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
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "../../components/Navbar";
import { fetchUserData } from "@/utils/auth";

// Function to generate random tag colors
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
  const [
    userClubsWithOpportunityPermission,
    setUserClubsWithOpportunityPermission,
  ] = useState([]);
  const [
    userBoardsWithOpportunityPermission,
    setUserBoardsWithOpportunityPermission,
  ] = useState([]);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [currentClubId, setCurrentClubId] = useState(null);

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

  // Load opportunities on mount
  useEffect(() => {
    fetchOpportunities();
  }, []);

  // Fetch Single Opportunity for Editing
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

  // Update Opportunity
  const updateOpportunity = async (updatedOpportunity) => {
    try {
      const response = await fetch(
        `http://localhost:5000/opportunities/${updatedOpportunity._id}`,
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
        const response = await fetch("http://localhost:5000/opportunities", {
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
    <div>
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
        <Container maxWidth="lg" sx={{ pt: 2 }}>
          {/* Opportunities Grid */}
          <Grid container spacing={3} justifyContent="center">
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((opportunity) => (
                <Grid item key={opportunity._id} xs={12} sm={6} md={4}>
                  <Card elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                    {/* Image at the top of the card */}
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
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h6">
                          {opportunity.title}
                        </Typography>
                        {hasOpportunityPermission(opportunity) && (
                          <Box>
                            <IconButton
                              onClick={() => handleEdit(opportunity)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(opportunity._id)}
                              color="error"
                            >
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
                        <strong>Status:</strong>{" "}
                        {opportunity.status?.toUpperCase()}
                      </Typography>

                      {opportunity.tags && opportunity.tags.length > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 2,
                          }}
                        >
                          {opportunity.tags.map((tag, index) => (
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
                  <Typography variant="body1" color="text.secondary">
                    No opportunities matching your search criteria
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>

        {/* Add Opportunity FAB */}
        {false && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleCreate}
            sx={{
              position: "fixed",
              bottom: 20,
              right: 20,
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
