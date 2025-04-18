"use client";
import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  TextField,
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
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";

const PositionManagement = ({
  positions,
  users,
  privilegeTypes,
  organizationType,
  loading,
  onAddPosition,
  onEditPosition,
  onDeletePosition,
  clubs = [], // Add clubs prop for board admins
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPositions, setFilteredPositions] = useState(positions);
  const [isEdit, setIsEdit] = useState(false);
  const [newPosition, setNewPosition] = useState({
    user_id: "",
    privilegeTypeId: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    ...(organizationType === "board" && { club_id: "" }), // Add club_id for board admins
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
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
        position.status?.toLowerCase().includes(term)
    );

    setFilteredPositions(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPosition((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      user_id: selectedPosition.user_id?._id || "",
      privilegeTypeId: selectedPosition.privilegeTypeId?._id || "",
      start_date: selectedPosition.start_date
        ? formatDate(selectedPosition.start_date)
        : "",
      end_date: selectedPosition.end_date
        ? formatDate(selectedPosition.end_date)
        : "",
      ...(organizationType === "board" && {
        club_id: selectedPosition.club_id?._id || "",
      }),
    });
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeletePosition(selectedPosition);
    handleMenuClose();
  };

  const handleOpenDialog = () => {
    setIsEdit(false);
    setNewPosition({
      user_id: "",
      privilegeTypeId: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      ...(organizationType === "board" && { club_id: "" }),
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEdit(false);
  };

  const handleSubmit = () => {
    if (isEdit) {
      onEditPosition(selectedPosition._id, newPosition);
    } else {
      onAddPosition(newPosition);
    }
    handleCloseDialog();
  };

  return (
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
                <TableCell>
                  {organizationType === "board" && "Club/Board"}
                </TableCell>
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
                      {organizationType === "board" &&
                        (position.club_id?.name ||
                          position.board_id?.name ||
                          "N/A")}
                    </TableCell>
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
                      <IconButton onClick={(e) => handleMenuClick(e, position)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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

          {organizationType === "board" && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Club (Optional)</InputLabel>
              <Select
                name="club_id"
                value={newPosition.club_id}
                label="Club (Optional)"
                onChange={handleInputChange}
              >
                <MenuItem value="">None (Board Position)</MenuItem>
                {clubs.map((club) => (
                  <MenuItem key={club._id} value={club._id}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <GroupsIcon sx={{ mr: 1 }} />
                      {club.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

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
  );
};

export default PositionManagement;
