import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
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
  Divider,
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
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  VpnKey as VpnKeyIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";

const handleEmailClick = (email) => {
  window.location.href = `mailto:${email}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "Present";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const SearchableUserSelect = ({ users, value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <FormControl fullWidth>
      <InputLabel id="user-select-label">User</InputLabel>
      <Select
        labelId="user-select-label"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={value}
        label="User"
        onChange={onChange}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
      >
        <Box sx={{ p: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onClick={(e) => e.stopPropagation()}
            size={isMobile ? "small" : "medium"}
          />
        </Box>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <MenuItem key={user._id} value={user._id}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{ width: 24, height: 24, mr: 2, fontSize: "0.75rem" }}
                >
                  {user.username?.charAt(0) || user.email?.charAt(0) || "?"}
                </Avatar>
                <Box>
                  <Typography>
                    {user.username || user.email || "No username"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email || "No email"}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No users found</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

const POR = () => {
  const [tabValue, setTabValue] = useState(0);
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [boards, setBoards] = useState([]);
  const [privilegeTypes, setPrivilegeTypes] = useState([]);
  const [newPosition, setNewPosition] = useState({
    user_id: "",
    privilegeTypeId: "",
    club_id: "",
    board_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        usersData,
        clubsData,
        boardsData,
        privilegeTypesData,
        positionsData,
      ] = await Promise.all([
        fetchData("http://localhost:5000/users/users"),
        fetchData("http://localhost:5000/clubs/clubs"),
        fetchData("http://localhost:5000/boards"),
        fetchData("http://localhost:5000/por2/privilege-types"),
        fetchData("http://localhost:5000/por2/por"),
      ]);

      const formattedUsers = usersData.map((user) => ({
        _id: user._id,
        username: user.name,
        email: user.email_id,
        department: user.department,
        status: user.status,
      }));

      setUsers(formattedUsers);
      setClubs(clubsData);
      setBoards(boardsData);
      setPrivilegeTypes(privilegeTypesData);
      setFilteredPrivilegeTypes(privilegeTypesData);

      const formattedPositions = await formatPositions(
        positionsData,
        formattedUsers,
        clubsData,
        boardsData,
        privilegeTypesData
      );
      setPositions(formattedPositions);
      setFilteredPositions(formattedPositions);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPositions = async (
    positions,
    users,
    clubs,
    boards,
    privilegeTypes
  ) => {
    return positions.map((position) => {
      let userDetails = users.find((user) => user._id === position.user_id._id) || {};
      
      let clubDetails = position.club_id
        ? clubs.find((club) => club._id === position.club_id._id)
        : null;
        
      let boardDetails = position.board_id
        ? boards.find((board) => board._id === position.board_id._id)
        : null;
        
      let privilegeDetails =
        privilegeTypes.find((priv) => priv._id === position.privilegeTypeId?._id) ||
        {};

      return {
        ...position,
        user: userDetails.username || "Unknown User",
        email: userDetails.email || "N/A",
        position: privilegeDetails.position || "Unknown Position",
        organization: clubDetails
          ? clubDetails.name
          : boardDetails
          ? boardDetails.name
          : "N/A",
        organizationType: clubDetails ? "Club" : boardDetails ? "Board" : "N/A",
        status:
          position.end_date && new Date(position.end_date) < new Date()
            ? "Completed"
            : "Active",
      };
    });
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
        position.organization?.toLowerCase().includes(term) ||
        position.status?.toLowerCase().includes(term)
    );

    setFilteredPositions(filtered);
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewPosition((prev) => {
      if (name === "club_id" && value) {
        return {
          ...prev,
          club_id: value,
          board_id: "",
        };
      }

      if (name === "board_id" && value) {
        return {
          ...prev,
          board_id: value,
          club_id: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handlePrivilegeInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewPrivilegeType((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const porData = {
        ...newPosition,
      };

      if (!porData.club_id) delete porData.club_id;
      if (!porData.board_id) delete porData.board_id;

      const url = isEdit
        ? `http://localhost:5000/por2/por/${selectedPosition._id}`
        : "http://localhost:5000/por2/por";

      const method = isEdit ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(porData),
      });

      fetchAllData();
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting POR data:", error);
    }
  };

  const handlePrivilegeSubmit = async () => {
    try {
      const url = isEditPrivilege
        ? `http://localhost:5000/por2/privilege-types/${selectedPrivilegeType._id}`
        : "http://localhost:5000/por2/privilege-types";

      const method = isEditPrivilege ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPrivilegeType),
      });

      fetchAllData();
      handleClosePrivilegeDialog();
    } catch (error) {
      console.error("Error submitting privilege data:", error);
    }
  };

  const handleMenuClick = (event, position) => {
    setAnchorEl(event.currentTarget);
    setSelectedPosition(position);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEdit(true);
    setNewPosition({
      user_id: selectedPosition.user_id._id || "",
      privilegeTypeId: selectedPosition.privilegeTypeId._id || "",
      club_id: selectedPosition.club_id ? selectedPosition.club_id._id : "",
      board_id: selectedPosition.board_id ? selectedPosition.board_id._id : "",
      start_date: selectedPosition.start_date ? formatDate(selectedPosition.start_date) : "",
      end_date: selectedPosition.end_date ? formatDate(selectedPosition.end_date) : "",
    });
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:5000/por2/por/${selectedPosition._id}`, {
        method: "DELETE",
      });
      fetchAllData();
      handleMenuClose();
    } catch (error) {
      console.error("Error deleting POR:", error);
    }
  };

  const handlePrivilegeMenuClick = (event, privilege) => {
    setPrivilegeAnchorEl(event.currentTarget);
    setSelectedPrivilegeType(privilege);
  };

  const handlePrivilegeMenuClose = () => {
    setPrivilegeAnchorEl(null);
  };

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

  const handleDeletePrivilege = async () => {
    try {
      await fetch(
        `http://localhost:5000/por2/privilege-types/${selectedPrivilegeType._id}`,
        {
          method: "DELETE",
        }
      );
      fetchAllData();
      handlePrivilegeMenuClose();
    } catch (error) {
      console.error("Error deleting privilege type:", error);
    }
  };

  const handleOpenDialog = () => {
    setIsEdit(false);
    setNewPosition({
      user_id: "",
      privilegeTypeId: "",
      club_id: "",
      board_id: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEdit(false);
  };

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

  const handleClosePrivilegeDialog = () => {
    setOpenPrivilegeDialog(false);
    setIsEditPrivilege(false);
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
        >
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label={isMobile ? "POR" : "Positions of Responsibility"}
            sx={{ fontWeight: "bold", minWidth: 'auto' }}
          />
          <Tab
            icon={<VpnKeyIcon />}
            iconPosition="start"
            label={isMobile ? "Privileges" : "Privilege Types"}
            sx={{ fontWeight: "bold", minWidth: 'auto' }}
          />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              mb: 3,
              gap: isMobile ? 2 : 0
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{ fontWeight: "bold", color: "#6a1b9a" }}
            >
              Positions of Responsibility
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: "#6a1b9a",
                "&:hover": { backgroundColor: "#4a148c" },
              }}
              fullWidth={isMobile}
            >
              Add New Position
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", mb: 3, gap: isMobile ? 2 : 0 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name, email, position, organization or status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: isMobile ? 0 : 2 }}
              size={isMobile ? "small" : "medium"}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                backgroundColor: "#6a1b9a",
                "&:hover": { backgroundColor: "#4a148c" },
                minWidth: isMobile ? "100%" : "100px",
              }}
            >
              Search
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f3e5f5" }}>
                    <TableRow>
                      <TableCell width="50px">#</TableCell>
                      <TableCell>User</TableCell>
                      {!isMobile && <TableCell>Email</TableCell>}
                      <TableCell>Position</TableCell>
                      {!isMobile && <TableCell>Organization</TableCell>}
                      {!isMobile && <TableCell>Type</TableCell>}
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPositions.length > 0 ? (
                      filteredPositions.map((position, index) => (
                        <TableRow key={position._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar sx={{ bgcolor: "#6a1b9a", mr: 2 }}>
                                {position.user ? position.user.charAt(0) : "U"}
                              </Avatar>
                              {isMobile ? (
                                <Box>
                                  <Typography>{position.user || "Unknown User"}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {position.position || "Unknown Position"}
                                  </Typography>
                                </Box>
                              ) : (
                                position.user || "Unknown User"
                              )}
                            </Box>
                          </TableCell>
                          {!isMobile && (
                            <TableCell>
                              {position.email && (
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
                                  onClick={() => handleEmailClick(position.email)}
                                >
                                  <EmailIcon
                                    sx={{ mr: 1, color: "#6a1b9a" }}
                                    fontSize="small"
                                  />
                                  {position.email}
                                </Box>
                              )}
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell>
                              {position.position || "Unknown Position"}
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell>
                              <Chip
                                label={position.organization || "N/A"}
                                size="small"
                                sx={{
                                  backgroundColor: "#e1bee7",
                                  color: "#4a148c",
                                }}
                              />
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell>
                              <Chip
                                icon={
                                  position.organizationType === "Club" ? (
                                    <GroupsIcon />
                                  ) : (
                                    <SchoolIcon />
                                  )
                                }
                                label={position.organizationType || "N/A"}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    position.organizationType === "Club"
                                      ? "#bbdefb"
                                      : "#c8e6c9",
                                  color:
                                    position.organizationType === "Club"
                                      ? "#0d47a1"
                                      : "#1b5e20",
                                }}
                              />
                            </TableCell>
                          )}
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
                        <TableCell colSpan={isMobile ? 6 : 9} align="center">
                          No positions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid #e0e0e0",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredPositions.length}{" "}
                  {filteredPositions.length === 1 ? "result" : "results"}
                  {filteredPositions.length !== positions.length &&
                    ` (filtered from ${positions.length} total)`}
                </Typography>
              </Box>
            </Paper>
          )}

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="sm"
            fullScreen={isMobile}
          >
            <DialogTitle>
              {isEdit ? "Edit Position" : "Add New Position"}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <SearchableUserSelect
                  users={users}
                  value={newPosition.user_id}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "user_id",
                        value: e.target.value,
                      },
                    })
                  }
                />
              </Box>

              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="privilege-select-label">Position</InputLabel>
                <Select
                  labelId="privilege-select-label"
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

              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="club-select-label">Club</InputLabel>
                <Select
                  labelId="club-select-label"
                  name="club_id"
                  value={newPosition.club_id}
                  label="Club"
                  onChange={(e) => {
                    setNewPosition((prev) => ({
                      ...prev,
                      club_id: e.target.value,
                      board_id: e.target.value ? "" : prev.board_id,
                    }));
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {clubs.map((club) => (
                    <MenuItem key={club._id} value={club._id}>
                      {club.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="board-select-label">Board</InputLabel>
                <Select
                  labelId="board-select-label"
                  name="board_id"
                  value={newPosition.board_id}
                  label="Board"
                  onChange={(e) => {
                    setNewPosition((prev) => ({
                      ...prev,
                      board_id: e.target.value,
                      club_id: e.target.value ? "" : prev.club_id,
                    }));
                  }}
                  disabled={Boolean(newPosition.club_id)}
                >
                  <MenuItem value="">None</MenuItem>
                  {boards.map((board) => (
                    <MenuItem key={board._id} value={board._id}>
                      {board.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    margin="dense"
                    name="start_date"
                    label="Start Date"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={newPosition.start_date}
                    onChange={handleInputChange}
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    margin="dense"
                    name="end_date"
                    label="End Date"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={newPosition.end_date}
                    onChange={handleInputChange}
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={{ color: "#6a1b9a" }}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": { backgroundColor: "#4a148c" },
                }}
              >
                {isEdit ? "Update Position" : "Add Position"}
              </Button>
            </DialogActions>
          </Dialog>

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

      {tabValue === 1 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              mb: 3,
              gap: isMobile ? 2 : 0
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{ fontWeight: "bold", color: "#6a1b9a" }}
            >
              Privilege Types
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenPrivilegeDialog}
              sx={{
                backgroundColor: "#6a1b9a",
                "&:hover": { backgroundColor: "#4a148c" },
              }}
              fullWidth={isMobile}
            >
              Add New Privilege
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", mb: 3, gap: isMobile ? 2 : 0 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by position or description"
              value={privilegeSearchTerm}
              onChange={(e) => setPrivilegeSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: isMobile ? 0 : 2 }}
              size={isMobile ? "small" : "medium"}
            />
            <Button
              variant="contained"
              onClick={handlePrivilegeSearch}
              sx={{
                backgroundColor: "#6a1b9a",
                "&:hover": { backgroundColor: "#4a148c" },
                minWidth: isMobile ? "100%" : "100px",
              }}
            >
              Search
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f3e5f5" }}>
                    <TableRow>
                      <TableCell width="50px">#</TableCell>
                      <TableCell>Position</TableCell>
                      {!isMobile && <TableCell>Description</TableCell>}
                      <TableCell>Permissions</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPrivilegeTypes.length > 0 ? (
                      filteredPrivilegeTypes.map((privilege, index) => (
                        <TableRow key={privilege._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar sx={{ bgcolor: "#6a1b9a", mr: 2 }}>
                                <BadgeIcon />
                              </Avatar>
                              {privilege.position}
                            </Box>
                          </TableCell>
                          {!isMobile && (
                            <TableCell>{privilege.description}</TableCell>
                          )}
                          <TableCell>
                            <Box
                              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                            >
                              {privilege.posts && (
                                <Chip
                                  label="Posts"
                                  size="small"
                                  color="primary"
                                />
                              )}
                              {privilege.events && (
                                <Chip
                                  label="Events"
                                  size="small"
                                  color="secondary"
                                />
                              )}
                              {privilege.projects && (
                                <Chip
                                  label="Projects"
                                  size="small"
                                  color="success"
                                />
                              )}
                              {privilege.resources && (
                                <Chip
                                  label="Resources"
                                  size="small"
                                  color="info"
                                />
                              )}
                              {privilege.opportunities && (
                                <Chip
                                  label="Opportunities"
                                  size="small"
                                  color="warning"
                                />
                              )}
                              {privilege.blogs && (
                                <Chip
                                  label="Blogs"
                                  size="small"
                                  color="error"
                                />
                              )}
                              {privilege.forums && (
                                <Chip
                                  label="Forums"
                                  size="small"
                                  sx={{ bgcolor: "#9c27b0", color: "white" }}
                                />
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
                        <TableCell colSpan={isMobile ? 4 : 5} align="center">
                          No privilege types found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid #e0e0e0",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredPrivilegeTypes.length}{" "}
                  {filteredPrivilegeTypes.length === 1 ? "result" : "results"}
                  {filteredPrivilegeTypes.length !== privilegeTypes.length &&
                    ` (filtered from ${privilegeTypes.length} total)`}
                </Typography>
              </Box>
            </Paper>
          )}

          <Dialog
            open={openPrivilegeDialog}
            onClose={handleClosePrivilegeDialog}
            fullWidth
            maxWidth="sm"
            fullScreen={isMobile}
          >
            <DialogTitle>
              {isEditPrivilege
                ? "Edit Privilege Type"
                : "Add New Privilege Type"}
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
                size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
              />

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Permissions
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newPrivilegeType.posts}
                        onChange={handlePrivilegeInputChange}
                        name="posts"
                      />
                    }
                    label="Posts"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newPrivilegeType.events}
                        onChange={handlePrivilegeInputChange}
                        name="events"
                      />
                    }
                    label="Events"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newPrivilegeType.projects}
                        onChange={handlePrivilegeInputChange}
                        name="projects"
                      />
                    }
                    label="Projects"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newPrivilegeType.resources}
                        onChange={handlePrivilegeInputChange}
                        name="resources"
                      />
                    }
                    label="Resources"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newPrivilegeType.opportunities}
                        onChange={handlePrivilegeInputChange}
                        name="opportunities"
                      />
                    }
                    label="Opportunities"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newPrivilegeType.blogs}
                        onChange={handlePrivilegeInputChange}
                        name="blogs"
                      />
                    }
                    label="Blogs"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newPrivilegeType.forums}
                        onChange={handlePrivilegeInputChange}
                        name="forums"
                      />
                    }
                    label="Forums"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClosePrivilegeDialog}
                sx={{ color: "#6a1b9a" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePrivilegeSubmit}
                variant="contained"
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": { backgroundColor: "#4a148c" },
                }}
              >
                {isEditPrivilege
                  ? "Update Privilege Type"
                  : "Add Privilege Type"}
              </Button>
            </DialogActions>
          </Dialog>

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
    </Box>
  );
};

export default POR;