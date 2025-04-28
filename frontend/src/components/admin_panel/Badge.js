// pages/badge-management.js
"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
  ListSubheader,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

export default function BadgeManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // State for tab navigation
  const [tabValue, setTabValue] = useState(0);

  // State for data
  const [badges, setBadges] = useState([]);
  const [badgeTypes, setBadgeTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [boards, setBoards] = useState([]);

  // State for search
  const [searchQuery, setSearchQuery] = useState("");

  // State for dialogs
  const [openBadgeDialog, setOpenBadgeDialog] = useState(false);
  const [openBadgeTypeDialog, setOpenBadgeTypeDialog] = useState(false);

  // State for forms
  const [newBadge, setNewBadge] = useState({
    user_id: "",
    given_on: new Date().toISOString().split("T")[0], // Format: YYYY-MM-DD
    club_id: "",
    board_id: "",
    badge_type_id: "",
  });

  const [newBadgeType, setNewBadgeType] = useState({
    title: "",
    description: "",
    emoji: "",
  });

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // State for notifications
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchBadges();
    fetchBadgeTypes();
    fetchUsers();
    fetchClubs();
    fetchBoards();
  }, []);

  // Fetch data functions
  const fetchBadges = async () => {
    try {
      const response = await fetch("http://localhost:5000/badges/badges");
      const data = await response.json();
      setBadges(data);
    } catch (error) {
      console.error("Error fetching badges:", error);
      showAlert("Failed to fetch badges", "error");
    }
  };

  const fetchBadgeTypes = async () => {
    try {
      const response = await fetch("http://localhost:5000/badges/badge-types");
      const data = await response.json();
      setBadgeTypes(data);
    } catch (error) {
      console.error("Error fetching badge types:", error);
      showAlert("Failed to fetch badge types", "error");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/users/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showAlert("Failed to fetch users", "error");
    }
  };

  const fetchClubs = async () => {
    try {
      const response = await fetch("http://localhost:5000/clubs/clubs");
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      showAlert("Failed to fetch clubs", "error");
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await fetch("http://localhost:5000/boards");
      const data = await response.json();
      setBoards(data);
    } catch (error) {
      console.error("Error fetching boards:", error);
      showAlert("Failed to fetch boards", "error");
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const username = user.username || "";
    const email = user.email || "";
    const name = user.name || "";
    const query = searchQuery.toLowerCase();

    return (
      username.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      name.toLowerCase().includes(query)
    );
  });

  // Dialog handlers
  const handleOpenBadgeDialog = (badge = null) => {
    if (badge) {
      setNewBadge({
        user_id: badge.user_id?._id || badge.user_id,
        given_on: new Date(badge.given_on).toISOString().split("T")[0],
        club_id: badge.club_id?._id || badge.club_id || "",
        board_id: badge.board_id?._id || badge.board_id || "",
        badge_type_id: badge.badge_type_id?._id || badge.badge_type_id,
      });
      setIsEditing(true);
      setCurrentId(badge._id);
    } else {
      setNewBadge({
        user_id: "",
        given_on: new Date().toISOString().split("T")[0],
        club_id: "",
        board_id: "",
        badge_type_id: "",
      });
      setIsEditing(false);
    }
    setSearchQuery(""); // Reset search query
    setOpenBadgeDialog(true);
  };

  const handleOpenBadgeTypeDialog = (badgeType = null) => {
    if (badgeType) {
      setNewBadgeType({
        title: badgeType.title,
        description: badgeType.description,
        emoji: badgeType.emoji,
      });
      setIsEditing(true);
      setCurrentId(badgeType._id);
    } else {
      setNewBadgeType({
        title: "",
        description: "",
        emoji: "",
      });
      setIsEditing(false);
    }
    setOpenBadgeTypeDialog(true);
  };

  // Form input handlers
  const handleBadgeChange = (prop) => (event) => {
    // If club_id is changed, reset board_id (since they are mutually exclusive)
    if (prop === "club_id" && event.target.value) {
      setNewBadge({ ...newBadge, [prop]: event.target.value, board_id: "" });
    }
    // If board_id is changed, reset club_id (since they are mutually exclusive)
    else if (prop === "board_id" && event.target.value) {
      setNewBadge({ ...newBadge, [prop]: event.target.value, club_id: "" });
    } else {
      setNewBadge({ ...newBadge, [prop]: event.target.value });
    }
  };

  const handleBadgeTypeChange = (prop) => (event) => {
    setNewBadgeType({ ...newBadgeType, [prop]: event.target.value });
  };

  // CRUD operations for badges
  const createOrUpdateBadge = async () => {
    try {
      const url = isEditing
        ? `http://localhost:5000/badges/badges/${currentId}`
        : "http://localhost:5000/badges/badges";

      const method = isEditing ? "PUT" : "POST";

      const badgeData = {
        ...newBadge,
        given_on: new Date(newBadge.given_on).toISOString(),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(badgeData),
      });

      if (!response.ok) {
        throw new Error("Failed to save badge");
      }

      setOpenBadgeDialog(false);
      fetchBadges();
      showAlert(`Badge ${isEditing ? "updated" : "created"} successfully`);
    } catch (error) {
      console.error("Error saving badge:", error);
      showAlert(`Failed to ${isEditing ? "update" : "create"} badge`, "error");
    }
  };

  const deleteBadge = async (id) => {
    if (window.confirm("Are you sure you want to delete this badge?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/badges/badges/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete badge");
        }

        fetchBadges();
        showAlert("Badge deleted successfully");
      } catch (error) {
        console.error("Error deleting badge:", error);
        showAlert("Failed to delete badge", "error");
      }
    }
  };

  // CRUD operations for badge types
  const createOrUpdateBadgeType = async () => {
    try {
      const url = isEditing
        ? `http://localhost:5000/badges/badge-types/${currentId}`
        : "http://localhost:5000/badges/badge-types";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBadgeType),
      });

      if (!response.ok) {
        throw new Error("Failed to save badge type");
      }

      setOpenBadgeTypeDialog(false);
      fetchBadgeTypes();
      showAlert(`Badge type ${isEditing ? "updated" : "created"} successfully`);
    } catch (error) {
      console.error("Error saving badge type:", error);
      showAlert(
        `Failed to ${isEditing ? "update" : "create"} badge type`,
        "error"
      );
    }
  };

  const deleteBadgeType = async (id) => {
    if (window.confirm("Are you sure you want to delete this badge type?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/badges/badge-types/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete badge type");
        }

        fetchBadgeTypes();
        showAlert("Badge type deleted successfully");
      } catch (error) {
        console.error("Error deleting badge type:", error);
        showAlert("Failed to delete badge type", "error");
      }
    }
  };

  // Alert notification
  const showAlert = (message, severity = "success") => {
    setAlert({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: isMobile ? 2 : 4,
        mb: isMobile ? 2 : 4,
        p: isMobile ? 1 : 3,
        backgroundColor:
          theme.palette.mode === "dark"
            ? "#121212"
            : theme.palette.background.default,
        borderRadius: 2,
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        component="h1"
        gutterBottom
        color="primary"
        sx={{
          fontWeight: "bold",
          textShadow:
            theme.palette.mode === "dark"
              ? "0 0 10px rgba(64, 195, 255, 0.3)"
              : "none",
          textAlign: isMobile ? "center" : "left",
        }}
      >
        Badge Management System
      </Typography>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="badge management tabs"
          textColor="primary"
          indicatorColor="primary"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              fontWeight: "medium",
              fontSize: isMobile ? "0.875rem" : "1rem",
              minWidth: isMobile ? "auto" : undefined,
              px: isMobile ? 1 : undefined,
            },
          }}
        >
          <Tab label="Badges" />
          <Tab label="Badge Types" />
        </Tabs>
      </Box>

      {/* Badges Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenBadgeDialog()}
            size={isMobile ? "small" : "medium"}
            sx={{
              fontWeight: "bold",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 0 15px rgba(64, 195, 255, 0.3)"
                  : "",
              "&:hover": {
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 0 20px rgba(64, 195, 255, 0.4)"
                    : "",
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            {isMobile ? "Add" : "Add New Badge"}
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          elevation={4}
          sx={{
            borderRadius: 2,
            overflow: "auto",
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.primary.dark, 0.2)
                      : alpha(theme.palette.primary.light, 0.2),
                }}
              >
                <TableCell sx={{ fontWeight: "bold" }}>Badge Type</TableCell>
                {!isMobile && (
                  <>
                    <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date Given</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Club</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Board</TableCell>
                  </>
                )}
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {badges.length > 0 ? (
                badges.map((badge) => (
                  <TableRow
                    key={badge._id}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.action.hover, 0.05)
                            : alpha(theme.palette.action.hover, 0.05),
                      },
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.primary.dark, 0.1)
                            : alpha(theme.palette.primary.light, 0.1),
                      },
                    }}
                  >
                    <TableCell>
                      {badge.badge_type_id?.title || "N/A"}{" "}
                      {badge.badge_type_id?.emoji}
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>
                          {badge.user_id?.name}
                          {badge.user_id?.email_id && (
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              {badge.user_id.email_id}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(badge.given_on)}</TableCell>
                        <TableCell>{badge.club_id?.name || "N/A"}</TableCell>
                        <TableCell>{badge.board_id?.title || "N/A"}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenBadgeDialog(badge)}
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              theme.palette.mode === "dark" ? 0.2 : 0.1
                            ),
                          },
                        }}
                      >
                        <EditIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                      <IconButton
                        onClick={() => deleteBadge(badge._id)}
                        color="error"
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.error.main,
                              theme.palette.mode === "dark" ? 0.2 : 0.1
                            ),
                          },
                        }}
                      >
                        <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isMobile ? 2 : 6} align="center">
                    No badges found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Badge Types Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenBadgeTypeDialog()}
            size={isMobile ? "small" : "medium"}
            sx={{
              fontWeight: "bold",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 0 15px rgba(64, 195, 255, 0.3)"
                  : "",
              "&:hover": {
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 0 20px rgba(64, 195, 255, 0.4)"
                    : "",
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            {isMobile ? "Add" : "Add New Badge Type"}
          </Button>
        </Box>

        <Grid container spacing={isMobile ? 1 : 3}>
          {badgeTypes.length > 0 ? (
            badgeTypes.map((badgeType) => (
              <Grid item xs={12} sm={6} md={4} key={badgeType._id}>
                <Paper
                  elevation={4}
                  sx={{
                    p: isMobile ? 1 : 2,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 8px 20px rgba(0,0,0,0.4), 0 0 15px rgba(64, 195, 255, 0.15)"
                          : theme.shadows[8],
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                      pb: 1,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      component="h2"
                      color="primary"
                      sx={{ fontWeight: "bold" }}
                    >
                      {badgeType.title} {badgeType.emoji}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenBadgeTypeDialog(badgeType)}
                        color="primary"
                        sx={{
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              theme.palette.mode === "dark" ? 0.2 : 0.1
                            ),
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteBadgeType(badgeType._id)}
                        color="error"
                        sx={{
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.error.main,
                              theme.palette.mode === "dark" ? 0.2 : 0.1
                            ),
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      fontSize: isMobile ? "0.8125rem" : "0.875rem",
                    }}
                  >
                    {badgeType.description}
                  </Typography>
                </Paper>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
                elevation={4}
              >
                <Typography color="text.secondary">
                  No badge types found
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Badge Dialog */}
      <Dialog
        open={openBadgeDialog}
        onClose={() => setOpenBadgeDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          elevation: 24,
          sx: {
            borderRadius: isMobile ? 0 : 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.dark, 0.2)
                : alpha(theme.palette.primary.light, 0.2),
            fontWeight: "bold",
            color: theme.palette.primary.main,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          {isEditing ? "Edit Badge" : "Create New Badge"}
        </DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="normal">
            <InputLabel id="user-select-label">User</InputLabel>
            <Select
              labelId="user-select-label"
              value={newBadge.user_id}
              label="User"
              onChange={handleBadgeChange("user_id")}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    backgroundColor: theme.palette.background.paper,
                  },
                },
              }}
            >
              <ListSubheader>
                <TextField
                  autoFocus
                  fullWidth
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  onKeyDown={(e) => {
                    // Prevent select menu from closing on key press
                    if (e.key !== "Escape") {
                      e.stopPropagation();
                    }
                  }}
                />
              </ListSubheader>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    <div>
                      {user.username || user.name || "Unnamed User"}
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        {user.email_id || "No email"}
                      </Typography>
                    </div>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No users found</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="badge-type-select-label">Badge Type</InputLabel>
            <Select
              labelId="badge-type-select-label"
              value={newBadge.badge_type_id}
              label="Badge Type"
              onChange={handleBadgeChange("badge_type_id")}
            >
              {badgeTypes.map((type) => (
                <MenuItem key={type._id} value={type._id}>
                  {type.title} {type.emoji}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            label="Date Given"
            type="date"
            fullWidth
            value={newBadge.given_on}
            onChange={handleBadgeChange("given_on")}
            color="primary"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="club-select-label">Club (Optional)</InputLabel>
            <Select
              labelId="club-select-label"
              value={newBadge.club_id}
              label="Club (Optional)"
              onChange={handleBadgeChange("club_id")}
              disabled={Boolean(newBadge.board_id)}
            >
              <MenuItem value="">None</MenuItem>
              {clubs.map((club) => (
                <MenuItem key={club._id} value={club._id}>
                  {club.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="board-select-label">Board (Optional)</InputLabel>
            <Select
              labelId="board-select-label"
              value={newBadge.board_id}
              label="Board (Optional)"
              onChange={handleBadgeChange("board_id")}
              disabled={Boolean(newBadge.club_id)}
            >
              <MenuItem value="">None</MenuItem>
              {boards.map((board) => (
                <MenuItem key={board._id} value={board._id}>
                  {board.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(Boolean(newBadge.club_id) || Boolean(newBadge.board_id)) && (
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                display: "block",
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.warning.light
                    : theme.palette.warning.dark,
                fontWeight: "medium",
              }}
            >
              Note: Only a Club OR a Board can be selected, not both.
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Button
            onClick={() => setOpenBadgeDialog(false)}
            variant="outlined"
            sx={{
              color: theme.palette.text.secondary,
              borderColor: alpha(theme.palette.divider, 0.5),
              "&:hover": {
                borderColor: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.text.secondary, 0.05),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={createOrUpdateBadge}
            variant="contained"
            color="primary"
            sx={{
              fontWeight: "bold",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 0 10px rgba(64, 195, 255, 0.3)"
                  : "",
              "&:hover": {
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 0 15px rgba(64, 195, 255, 0.4)"
                    : "",
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Badge Type Dialog */}
      <Dialog
        open={openBadgeTypeDialog}
        onClose={() => setOpenBadgeTypeDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          elevation: 24,
          sx: {
            borderRadius: isMobile ? 0 : 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.dark, 0.2)
                : alpha(theme.palette.primary.light, 0.2),
            fontWeight: "bold",
            color: theme.palette.primary.main,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          {isEditing ? "Edit Badge Type" : "Create New Badge Type"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="normal"
            label="Title"
            fullWidth
            value={newBadgeType.title}
            onChange={handleBadgeTypeChange("title")}
            color="primary"
          />

          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            rows={isMobile ? 2 : 4}
            value={newBadgeType.description}
            onChange={handleBadgeTypeChange("description")}
            color="primary"
          />

          <TextField
            margin="normal"
            label="Emoji"
            fullWidth
            value={newBadgeType.emoji}
            onChange={handleBadgeTypeChange("emoji")}
            color="primary"
            placeholder="e.g. 🏆 🌟 🎯 🔥"
          />
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Button
            onClick={() => setOpenBadgeTypeDialog(false)}
            variant="outlined"
            sx={{
              color: theme.palette.text.secondary,
              borderColor: alpha(theme.palette.divider, 0.5),
              "&:hover": {
                borderColor: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.text.secondary, 0.05),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={createOrUpdateBadgeType}
            variant="contained"
            color="primary"
            sx={{
              fontWeight: "bold",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 0 10px rgba(64, 195, 255, 0.3)"
                  : "",
              "&:hover": {
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 0 15px rgba(64, 195, 255, 0.4)"
                    : "",
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            {isMobile ? (isEditing ? "Update" : "Create") : isEditing ? "Update Badge Type" : "Create Badge Type"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: isMobile ? "center" : "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          variant="filled"
          sx={{
            width: "100%",
            boxShadow: theme.shadows[6],
            borderRadius: 1,
            fontWeight: "medium",
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  const theme = useTheme();

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      sx={{
        backgroundColor:
          theme.palette.mode === "dark"
            ? "#121212"
            : theme.palette.background.default,
      }}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </Box>
  );
}