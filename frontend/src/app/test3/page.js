"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchUserData } from "@/utils/auth";
import {
  Box,
  Typography,
  Paper,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Grid,
  ListItemText,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  VpnKey as VpnKeyIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";

const PORManagement = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [managedOrganization, setManagedOrganization] = useState(null);
  const [organizationType, setOrganizationType] = useState(null);

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // POR state
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [privilegeTypes, setPrivilegeTypes] = useState([]);
  const [newPosition, setNewPosition] = useState({
    user_id: "",
    privilegeTypeId: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // PrivilegeType state
  const [openPrivilegeDialog, setOpenPrivilegeDialog] = useState(false);
  const [privilegeSearchTerm, setPrivilegeSearchTerm] = useState("");
  const [filteredPrivilegeTypes, setFilteredPrivilegeTypes] = useState([]);
  const [newPrivilegeType, setNewPrivilegeType] = useState({
    position: "",
    description: "",
    posts: false,
    events: false,
    projects: false,
    resources: false,
    opportunities: false,
    blogs: false,
    forums: false,
  });
  const [privilegeAnchorEl, setPrivilegeAnchorEl] = useState(null);
  const [selectedPrivilegeType, setSelectedPrivilegeType] = useState(null);
  const [isEditPrivilege, setIsEditPrivilege] = useState(false);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Fetch user data and determine organization
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchUserData();
        setCurrentUser(userData.userData);
        console.log(userData);

        if (userData.isClubAdmin) {
          setOrganizationType("club");
          const clubRes = await fetch(
            `http://localhost:5000/clubs/clubs/${userData?.club_id}`
          );
          const clubData = await clubRes.json();
          setManagedOrganization(clubData);
          console.log(clubData);
        } else if (userData.isBoardAdmin) {
          setOrganizationType("board");
          const boardRes = await fetch(
            `http://localhost:5000/boards/${userData?.board_id}`
          );
          const boardData = await boardRes.json();
          setManagedOrganization(boardData);
        } else {
          router.push("/unauthorized");
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        setSnackbar({
          open: true,
          message: "Failed to load user data",
          severity: "error",
        });
      }
    };

    loadUserData();
  }, [router]);

  // Fetch all necessary data
  useEffect(() => {
    if (!organizationType || !managedOrganization) return;

    // Fetch data and then filter PORs in the frontend
    // Fetch data and then filter PORs in the frontend
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch users, privilege types, and positions in parallel
        const [usersRes, privilegeTypesRes, positionsRes] = await Promise.all([
          fetch("http://localhost:5000/users/users"),
          fetch("http://localhost:5000/por2/privilege-types"),
          fetch(`http://localhost:5000/por2/por`), // Fetch all PORs without filtering
        ]);

        if (!usersRes.ok || !privilegeTypesRes.ok || !positionsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const usersData = await usersRes.json();
        const privilegeTypesData = await privilegeTypesRes.json();
        let positionsData = await positionsRes.json();

        console.log(organizationType);
        console.log(managedOrganization);
        // Filter positions based on organization type
        console.log(positionsData);
        if (organizationType === "board") {
          // For board admins, show PORs with matching board_id
          positionsData = positionsData.filter(
            (position) => position?.board_id?._id === managedOrganization._id
          );
        } else if (organizationType === "club") {
          // For club admins, show PORs with matching club_id
          positionsData = positionsData.filter(
            (position) => position?.club_id?._id === managedOrganization._id
          );
        }

        setUsers(usersData);
        setPrivilegeTypes(privilegeTypesData);
        setFilteredPrivilegeTypes(privilegeTypesData);

        // Format positions with user and privilege type info
        const formattedPositions = positionsData.map((position) => {
          const user =
            usersData.find((u) => u._id === position.user_id?._id) || {};
          const privilege =
            privilegeTypesData.find(
              (p) => p._id === position.privilegeTypeId?._id
            ) || {};

          return {
            ...position,
            user: user.name || "Unknown User",
            email: user.email_id || "N/A",
            position: privilege.position || "Unknown Position",
            status:
              position.end_date && new Date(position.end_date) < new Date()
                ? "Completed"
                : "Active",
          };
        });

        setPositions(formattedPositions);
        setFilteredPositions(formattedPositions);
      } catch (err) {
        console.error("Error fetching data:", err);
        setSnackbar({
          open: true,
          message: "Failed to load data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [organizationType, managedOrganization]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // POR search functionality
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredPositions(positions);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = positions.filter(
      (position) =>
        position.user?.toLowerCase().includes(term) ||
        position.email?.toLowerCase().includes(term) ||
        position.position?.toLowerCase().includes(term) ||
        position.status?.toLowerCase().includes(term)
    );

    setFilteredPositions(filtered);
  };

  // Privilege search functionality
  const handlePrivilegeSearch = () => {
    if (!privilegeSearchTerm.trim()) {
      setFilteredPrivilegeTypes(privilegeTypes);
      return;
    }

    const term = privilegeSearchTerm.toLowerCase();
    const filtered = privilegeTypes.filter(
      (privilege) =>
        privilege.position?.toLowerCase().includes(term) ||
        privilege.description?.toLowerCase().includes(term)
    );

    setFilteredPrivilegeTypes(filtered);
  };

  // POR form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPosition((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // PrivilegeType form input change handler
  const handlePrivilegeInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewPrivilegeType((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle POR form submission
  const handleSubmit = async () => {
    try {
      const porData = {
        ...newPosition,
        [`${organizationType}_id`]: managedOrganization._id,
      };

      const url = isEdit
        ? `http://localhost:5000/por2/por/${selectedPosition._id}`
        : "http://localhost:5000/por2/por";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(porData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save position");
      }

      const updatedPosition = await response.json();

      // Update local state without refreshing
      if (isEdit) {
        setPositions((prev) =>
          prev.map((pos) =>
            pos._id === updatedPosition._id
              ? {
                  ...pos,
                  ...updatedPosition,
                  user:
                    users.find((u) => u._id === updatedPosition.user_id)
                      ?.name || "Unknown User",
                  email:
                    users.find((u) => u._id === updatedPosition.user_id)
                      ?.email_id || "N/A",
                  position:
                    privilegeTypes.find(
                      (p) => p._id === updatedPosition.privilegeTypeId
                    )?.position || "Unknown Position",
                  status:
                    updatedPosition.end_date &&
                    new Date(updatedPosition.end_date) < new Date()
                      ? "Completed"
                      : "Active",
                }
              : pos
          )
        );
      } else {
        setPositions((prev) => [
          ...prev,
          {
            ...updatedPosition,
            user:
              users.find((u) => u._id === updatedPosition.user_id)?.name ||
              "Unknown User",
            email:
              users.find((u) => u._id === updatedPosition.user_id)?.email_id ||
              "N/A",
            position:
              privilegeTypes.find(
                (p) => p._id === updatedPosition.privilegeTypeId
              )?.position || "Unknown Position",
            status:
              updatedPosition.end_date &&
              new Date(updatedPosition.end_date) < new Date()
                ? "Completed"
                : "Active",
          },
        ]);
      }

      setSnackbar({
        open: true,
        message: `Position ${isEdit ? "updated" : "created"} successfully`,
        severity: "success",
      });
      handleCloseDialog();
    } catch (err) {
      console.error("Error submitting POR data:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to save position",
        severity: "error",
      });
    }
  };

  // Handle PrivilegeType form submission
  const handlePrivilegeSubmit = async () => {
    try {
      const url = isEditPrivilege
        ? `http://localhost:5000/por2/privilege-types/${selectedPrivilegeType._id}`
        : "http://localhost:5000/por2/privilege-types";

      const method = isEditPrivilege ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPrivilegeType),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save privilege type");
      }

      const updatedPrivilege = await response.json();

      // Update local state without refreshing
      if (isEditPrivilege) {
        setPrivilegeTypes((prev) =>
          prev.map((priv) =>
            priv._id === updatedPrivilege._id ? updatedPrivilege : priv
          )
        );
      } else {
        setPrivilegeTypes((prev) => [...prev, updatedPrivilege]);
      }

      setSnackbar({
        open: true,
        message: `Privilege type ${
          isEditPrivilege ? "updated" : "created"
        } successfully`,
        severity: "success",
      });
      handleClosePrivilegeDialog();
    } catch (err) {
      console.error("Error submitting privilege data:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to save privilege type",
        severity: "error",
      });
    }
  };

  // POR menu handlers
  const handleMenuClick = (event, position) => {
    setAnchorEl(event.currentTarget);
    setSelectedPosition(position);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Open POR edit dialog
  const handleEdit = () => {
    setIsEdit(true);
    setNewPosition({
      user_id: selectedPosition.user_id?._id || "",
      privilegeTypeId: selectedPosition.privilegeTypeId?._id || "",
      start_date: selectedPosition.start_date
        ? formatDate(selectedPosition.start_date)
        : "",
      end_date: selectedPosition.end_date
        ? formatDate(selectedPosition.end_date)
        : "",
    });
    setOpenDialog(true);
    handleMenuClose();
  };

  // Delete POR
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/por2/por/${selectedPosition._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete position");
      }

      // Update local state without refreshing
      setPositions((prev) =>
        prev.filter((pos) => pos._id !== selectedPosition._id)
      );

      setSnackbar({
        open: true,
        message: "Position deleted successfully",
        severity: "success",
      });
      handleMenuClose();
    } catch (err) {
      console.error("Error deleting POR:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete position",
        severity: "error",
      });
    }
  };

  // PrivilegeType menu handlers
  const handlePrivilegeMenuClick = (event, privilege) => {
    setPrivilegeAnchorEl(event.currentTarget);
    setSelectedPrivilegeType(privilege);
  };

  const handlePrivilegeMenuClose = () => {
    setPrivilegeAnchorEl(null);
  };

  // Open PrivilegeType edit dialog
  const handleEditPrivilege = () => {
    setIsEditPrivilege(true);
    setNewPrivilegeType({
      position: selectedPrivilegeType.position,
      description: selectedPrivilegeType.description,
      posts: selectedPrivilegeType.posts,
      events: selectedPrivilegeType.events,
      projects: selectedPrivilegeType.projects,
      resources: selectedPrivilegeType.resources,
      opportunities: selectedPrivilegeType.opportunities,
      blogs: selectedPrivilegeType.blogs,
      forums: selectedPrivilegeType.forums,
    });
    setOpenPrivilegeDialog(true);
    handlePrivilegeMenuClose();
  };

  // Delete PrivilegeType
  const handleDeletePrivilege = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/por2/privilege-types/${selectedPrivilegeType._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete privilege type");
      }

      // Update local state without refreshing
      setPrivilegeTypes((prev) =>
        prev.filter((priv) => priv._id !== selectedPrivilegeType._id)
      );

      setSnackbar({
        open: true,
        message: "Privilege type deleted successfully",
        severity: "success",
      });
      handlePrivilegeMenuClose();
    } catch (err) {
      console.error("Error deleting privilege type:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete privilege type",
        severity: "error",
      });
    }
  };

  // Open POR dialog
  const handleOpenDialog = () => {
    setIsEdit(false);
    setNewPosition({
      user_id: "",
      privilegeTypeId: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
    setOpenDialog(true);
  };

  // Close POR dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEdit(false);
  };

  // Open PrivilegeType dialog
  const handleOpenPrivilegeDialog = () => {
    setIsEditPrivilege(false);
    setNewPrivilegeType({
      position: "",
      description: "",
      posts: false,
      events: false,
      projects: false,
      resources: false,
      opportunities: false,
      blogs: false,
      forums: false,
    });
    setOpenPrivilegeDialog(true);
  };

  // Close PrivilegeType dialog
  const handleClosePrivilegeDialog = () => {
    setOpenPrivilegeDialog(false);
    setIsEditPrivilege(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!currentUser || !managedOrganization) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
        Welcome  {managedOrganization.name} Admin 😊
        </Typography>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ mb: 3 }}
        >
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Positions"
            sx={{ fontWeight: "bold" }}
          />
          <Tab
            icon={<VpnKeyIcon />}
            iconPosition="start"
            label="Privilege Types"
            sx={{ fontWeight: "bold" }}
          />
        </Tabs>

        {/* Positions Tab */}
        {tabValue === 0 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5">
                {organizationType === "club" ? "Club" : "Board"} Positions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": { backgroundColor: "#4a148c" },
                }}
              >
                Add New Position
              </Button>
            </Box>

            {/* Search Bar */}
            <Box sx={{ display: "flex", mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": { backgroundColor: "#4a148c" },
                  minWidth: "100px",
                }}
              >
                Search
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f3e5f5" }}>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPositions.length > 0 ? (
                      filteredPositions.map((position) => (
                        <TableRow key={position._id}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar sx={{ bgcolor: "#6a1b9a", mr: 2 }}>
                                {position.user?.charAt(0) || "U"}
                              </Avatar>
                              {position.user || "Unknown User"}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                "&:hover": {
                                  textDecoration: "underline",
                                  color: "#6a1b9a",
                                },
                              }}
                              onClick={() =>
                                (window.location.href = `mailto:${position.email}`)
                              }
                            >
                              <EmailIcon
                                sx={{ mr: 1, color: "#6a1b9a" }}
                                fontSize="small"
                              />
                              {position.email}
                            </Box>
                          </TableCell>
                          <TableCell>{position.position}</TableCell>
                          <TableCell>
                            {formatDate(position.start_date)} to{" "}
                            {formatDate(position.end_date)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={position.status}
                              size="small"
                              sx={{
                                backgroundColor:
                                  position.status === "Active"
                                    ? "#c8e6c9"
                                    : "#ffcdd2",
                                color:
                                  position.status === "Active"
                                    ? "#2e7d32"
                                    : "#c62828",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={(e) => handleMenuClick(e, position)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No positions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Add/Edit Position Dialog */}
            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>
                {isEdit ? "Edit Position" : "Add New Position"}
              </DialogTitle>
              <DialogContent>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>User</InputLabel>
                  <Select
                    name="user_id"
                    value={newPosition.user_id}
                    label="User"
                    onChange={handleInputChange}
                  >
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar sx={{ mr: 2, width: 24, height: 24 }}>
                            {user.name?.charAt(0) || "U"}
                          </Avatar>
                          {user.name} ({user.email_id})
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Position</InputLabel>
                  <Select
                    name="privilegeTypeId"
                    value={newPosition.privilegeTypeId}
                    label="Position"
                    onChange={handleInputChange}
                  >
                    {privilegeTypes.map((privilege) => (
                      <MenuItem key={privilege._id} value={privilege._id}>
                        {privilege.position}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      name="start_date"
                      value={newPosition.start_date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      name="end_date"
                      value={newPosition.end_date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  sx={{
                    backgroundColor: "#6a1b9a",
                    "&:hover": { backgroundColor: "#4a148c" },
                  }}
                >
                  {isEdit ? "Update" : "Create"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Position Context Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDelete}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        )}

        {/* Privilege Types Tab */}
        {tabValue === 1 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5">Privilege Types</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenPrivilegeDialog}
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": { backgroundColor: "#4a148c" },
                }}
              >
                New Privilege Type
              </Button>
            </Box>

            {/* Search Bar */}
            <Box sx={{ display: "flex", mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search privilege types..."
                value={privilegeSearchTerm}
                onChange={(e) => setPrivilegeSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 2 }}
              />
              <Button
                variant="contained"
                onClick={handlePrivilegeSearch}
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": { backgroundColor: "#4a148c" },
                  minWidth: "100px",
                }}
              >
                Search
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f3e5f5" }}>
                    <TableRow>
                      <TableCell>Position Title</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Permissions</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPrivilegeTypes.length > 0 ? (
                      filteredPrivilegeTypes.map((privilege) => (
                        <TableRow key={privilege._id}>
                          <TableCell>
                            <Typography fontWeight="medium">
                              {privilege.position}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {privilege.description || "No description"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {privilege.posts && (
                                <Chip label="Posts" size="small" />
                              )}
                              {privilege.events && (
                                <Chip label="Events" size="small" />
                              )}
                              {privilege.projects && (
                                <Chip label="Projects" size="small" />
                              )}
                              {privilege.resources && (
                                <Chip label="Resources" size="small" />
                              )}
                              {privilege.opportunities && (
                                <Chip label="Opportunities" size="small" />
                              )}
                              {privilege.blogs && (
                                <Chip label="Blogs" size="small" />
                              )}
                              {privilege.forums && (
                                <Chip label="Forums" size="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={(e) =>
                                handlePrivilegeMenuClick(e, privilege)
                              }
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No privilege types found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Add/Edit Privilege Dialog */}
            <Dialog
              open={openPrivilegeDialog}
              onClose={handleClosePrivilegeDialog}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>
                {isEditPrivilege ? "Edit Privilege Type" : "New Privilege Type"}
              </DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  name="position"
                  label="Position Title"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newPrivilegeType.position}
                  onChange={handlePrivilegeInputChange}
                  required
                />

                <TextField
                  margin="dense"
                  name="description"
                  label="Description"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newPrivilegeType.description}
                  onChange={handlePrivilegeInputChange}
                  multiline
                  rows={3}
                />

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Permissions
                </Typography>

                <Grid container spacing={2}>
                  {[
                    { name: "posts", label: "Posts" },
                    { name: "events", label: "Events" },
                    { name: "projects", label: "Projects" },
                    { name: "resources", label: "Resources" },
                    { name: "opportunities", label: "Opportunities" },
                    { name: "blogs", label: "Blogs" },
                    { name: "forums", label: "Forums" },
                  ].map((perm) => (
                    <Grid item xs={6} key={perm.name}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={newPrivilegeType[perm.name]}
                            onChange={handlePrivilegeInputChange}
                            name={perm.name}
                          />
                        }
                        label={perm.label}
                      />
                    </Grid>
                  ))}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClosePrivilegeDialog}>Cancel</Button>
                <Button
                  onClick={handlePrivilegeSubmit}
                  variant="contained"
                  sx={{
                    backgroundColor: "#6a1b9a",
                    "&:hover": { backgroundColor: "#4a148c" },
                  }}
                >
                  {isEditPrivilege ? "Update" : "Create"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Privilege Type Context Menu */}
            <Menu
              anchorEl={privilegeAnchorEl}
              open={Boolean(privilegeAnchorEl)}
              onClose={handlePrivilegeMenuClose}
            >
              <MenuItem onClick={handleEditPrivilege}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDeletePrivilege}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default PORManagement;
