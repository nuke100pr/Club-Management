"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { fetchUserData, hasPermission } from "@/utils/auth";

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
  const theme = useTheme();
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
  const [expandedTagsMap, setExpandedTagsMap] = useState({});
  const [arrayPermissions, setArrayPermissions] = useState({});

  const toggleExpandedTags = (opportunityId) => {
    setExpandedTagsMap((prev) => ({
      ...prev,
      [opportunityId]: !prev[opportunityId],
    }));
  };

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result);
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
            setCurrentClubId(clubsWithPermission[0]);
          }
        }

        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData.data.boards
          ).filter(
            (boardId) =>
              result.userData.data.boards[boardId].opportunities === true
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



  const allKeywords = Array.from(
    new Set(opportunities.flatMap((opportunity) => opportunity.tags || []))
  );

  const fetchOpportunities = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/opportunities`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
      await updateOpportunity(newOpportunity);
    } else {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/opportunities`,
          {
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
          }
        );

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

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opportunity) => {
      const matchesSearch =
        opportunity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        opportunity.board_id === categoryFilter ||
        opportunity.club_id === categoryFilter;

      const matchesTags =
        selectedKeywords.length === 0 ||
        opportunity.tags?.some((tag) => selectedKeywords.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [opportunities, searchTerm, categoryFilter, selectedKeywords]);

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
    <div
      style={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <Box sx={{ pt: 4 }}>
        <Container maxWidth="xl">
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

          <Grid container spacing={3}>
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((opportunity) => (
                <Grid item key={opportunity._id} xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      bgcolor: theme.palette.background.paper,
                      borderRadius: 4,
                      overflow: "hidden",
                      boxShadow: theme.shadows[2],
                      transition: "all 0.3s ease",
                      borderTop: "3px solid",
                      borderTopColor: theme.palette.primary.main,
                      "&:hover": {
                        boxShadow: theme.shadows[4],
                        transform: "translateY(-8px)",
                      },
                    }}
                  >
                    {opportunity.image && (
                      <Box
                        sx={{ height: 200, width: "100%", overflow: "hidden" }}
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

                    <Box sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{ color: "text.primary", flexGrow: 1 }}
                        >
                          {opportunity.title}
                        </Typography>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 5,
                            fontSize: "0.75rem",
                            ml: 1,
                            bgcolor:
                              opportunity.status?.toLowerCase() === "active"
                                ? "rgba(56,142,60,0.1)"
                                : "rgba(211,47,47,0.1)",
                            color:
                              opportunity.status?.toLowerCase() === "active"
                                ? "#388e3c"
                                : "#d32f2f",
                          }}
                        >
                          {opportunity.status?.toUpperCase()}
                        </Box>

                        {arrayPermissions[opportunity._id] && (
                          <Box sx={{ display: "flex", ml: 1 }}>
                            <IconButton
                              onClick={() => handleEdit(opportunity)}
                              size="small"
                              sx={{ color: "primary.main" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(opportunity._id)}
                              size="small"
                              sx={{ color: "error.main" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 2 }}
                      >
                        {opportunity.description}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          color: "text.secondary",
                        }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: 16, mr: 1 }} />
                        <Typography variant="body2">
                          {opportunity.start_date} - {opportunity.end_date}
                        </Typography>
                      </Box>

                      {opportunity.tags && opportunity.tags.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
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
                                  fontSize: "0.65rem",
                                  height: "22px",
                                  display: "flex",
                                  alignItems: "center",
                                  bgcolor: "rgba(95, 150, 230, 0.1)",
                                  color: getTagColor(index),
                                }}
                              >
                                {tag}
                              </Box>
                            ))}

                            {opportunity.tags.length > 3 &&
                              !expandedTagsMap[opportunity._id] && (
                                <Box
                                  onClick={() =>
                                    toggleExpandedTags(opportunity._id)
                                  }
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "primary.main",
                                    cursor: "pointer",
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  <AddIcon sx={{ fontSize: 14 }} />
                                  {opportunity.tags.length - 3}
                                </Box>
                              )}

                            {expandedTagsMap[opportunity._id] && (
                              <Box
                                onClick={() =>
                                  toggleExpandedTags(opportunity._id)
                                }
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "primary.main",
                                  cursor: "pointer",
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 14 }} />
                              </Box>
                            )}
                          </Box>
                        </Box>
                      )}

                      <Button
                        variant="contained"
                        fullWidth
                        href={opportunity.external_link}
                        target="_blank"
                        sx={{
                          background:
                            "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                          color: "white",
                          fontWeight: 500,
                          py: 1,
                          borderRadius: 2,
                          textTransform: "none",
                          boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                          "&:hover": {
                            boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s ease",
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
                    textAlign: "center",
                    borderRadius: 4,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: theme.shadows[2],
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

        <CreateResourceDialog
          open={openCreateDialog}
          handleClose={handleCloseDialog}
          onSuccess={handleSubmitDialog}
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
