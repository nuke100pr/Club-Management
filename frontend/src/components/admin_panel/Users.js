import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
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
  ListItemText,
  InputAdornment,
  useTheme,
  useMediaQuery,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  alpha
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  SupervisedUserCircle as SupervisedUserCircleIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { getAuthToken } from "@/utils/auth";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const darkMode = theme.palette.mode === 'dark';

  const [newUser, setNewUser] = useState({
    name: "",
    email_id: "",
    department: "",
    status: "active",
    userRole: "member",
    registered_at: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchUsers();
    }
  }, [authToken]);

  const fetchUsers = async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/users/users/", {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
      const mockUsers = [
        {
          _id: "1",
          name: "Rahul Sharma",
          email_id: "rahul@college.edu",
          department: "Computer Science",
          status: "active",
          userRole: "member",
          registered_at: "2020-08-15",
        },
        {
          _id: "2",
          name: "Priya Patel",
          email_id: "priya@college.edu",
          department: "Electrical Engineering",
          status: "active",
          userRole: "club_admin",
          registered_at: "2021-01-10",
        },
        {
          _id: "3",
          name: "Vikram Singh",
          email_id: "vikram@college.edu",
          department: "Mechanical Engineering",
          status: "banned",
          userRole: "member",
          registered_at: "2020-11-22",
        },
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email_id.toLowerCase().includes(term) ||
        (user.department && user.department.toLowerCase().includes(term)) ||
        user.status.toLowerCase().includes(term) ||
        user.userRole.toLowerCase().includes(term)
    );

    setFilteredUsers(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/users/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) throw new Error("Failed to add user");

      const addedUser = await response.json();
      const updatedUsers = [...users, addedUser];
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setOpenDialog(false);
      setNewUser({
        name: "",
        email_id: "",
        department: "",
        status: "active",
        userRole: "member",
        registered_at: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Failed to add user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handleEdit = () => {
    setEditUser({ ...selectedUser });
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handleEditSubmit = async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/users/users/${editUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(editUser),
        }
      );

      if (!response.ok) throw new Error("Failed to update user");

      const updatedUsers = users.map((user) =>
        user._id === editUser._id ? editUser : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setOpenEditDialog(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/users/users/${selectedUser._id}`,
        {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete user");

      const updatedUsers = users.filter(
        (user) => user._id !== selectedUser._id
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleBan = async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      const updatedUserData = { ...selectedUser, status: "banned" };
      const response = await fetch(
        `http://localhost:5000/users/users/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(updatedUserData),
        }
      );

      if (!response.ok) throw new Error("Failed to ban user");

      const updatedUsers = users.map((user) =>
        user._id === selectedUser._id ? { ...user, status: "banned" } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error("Error banning user:", error);
      setError("Failed to ban user. Please try again.");
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleUnban = async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      const updatedUserData = { ...selectedUser, status: "active" };
      const response = await fetch(
        `http://localhost:5000/users/users/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(updatedUserData),
        }
      );

      if (!response.ok) throw new Error("Failed to unban user");

      const updatedUsers = users.map((user) =>
        user._id === selectedUser._id ? { ...user, status: "active" } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error("Error unbanning user:", error);
      setError("Failed to unban user. Please try again.");
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const getUserRoleIcon = (role) => {
    switch (role) {
      case "super_admin":
        return <AdminPanelSettingsIcon fontSize="small" />;
      case "board_admin":
        return <SupervisedUserCircleIcon fontSize="small" />;
      case "club_admin":
        return <GroupsIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  const getUserRoleLabel = (role) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "board_admin":
        return "Board Admin";
      case "club_admin":
        return "Club Admin";
      default:
        return "Member";
    }
  };

  const getStatusChipProps = (status) => {
    if (status === "active") {
      return {
        icon: <CheckCircleIcon fontSize="small" />,
        label: "Active",
        sx: {
          backgroundColor: darkMode ? alpha(theme.palette.success.dark, 0.2) : alpha(theme.palette.success.light, 0.2),
          color: darkMode ? theme.palette.success.light : theme.palette.success.dark,
          fontWeight: 500,
        },
      };
    } else {
      return {
        icon: <BlockIcon fontSize="small" />,
        label: "Banned",
        sx: {
          backgroundColor: darkMode ? alpha(theme.palette.error.dark, 0.2) : alpha(theme.palette.error.light, 0.2),
          color: darkMode ? theme.palette.error.light : theme.palette.error.dark,
          fontWeight: 500,
        },
      };
    }
  };

  const renderTableCell = (content, mobileLabel = '', align = 'left') => {
    if (isMobile) {
      return (
        <TableCell align={align} sx={{ display: 'flex', flexDirection: 'column', py: 1.5 }}>
          {mobileLabel && (
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              {mobileLabel}
            </Typography>
          )}
          {content}
        </TableCell>
      );
    }
    return <TableCell align={align}>{content}</TableCell>;
  };

  if (loading && users.length === 0) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "50vh",
        bgcolor: darkMode ? 'background.default' : '#f8faff'
      }}>
        <CircularProgress sx={{ color: "#4776E6" }} />
      </Box>
    );
  }

  if (error && users.length === 0) {
    return (
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "50vh",
        p: 4,
        bgcolor: darkMode ? 'background.default' : '#f8faff'
      }}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{
            mt: 2,
            background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)'
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 1 : 3,
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'auto',
      bgcolor: darkMode ? 'background.default' : '#f8faff'
    }}>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 3,
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="h5" sx={{
          background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 600
        }}>
          User Management
        </Typography>
        
        <motion.div whileHover={{ scale: 1.02 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              minWidth: isMobile ? '100%' : '160px',
              background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)'
            }}
          >
            {isMobile ? 'Add User' : 'Add New User'}
          </Button>
        </motion.div>
      </Box>

      {/* Search Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2,
        mb: 3
      }}>
        <TextField
          fullWidth
          size={isMobile ? 'small' : 'medium'}
          placeholder={isMobile ? 'Search users...' : 'Search users by name, email, department...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: isMobile ? '100%' : '400px'
          }}
        />
        <motion.div whileHover={{ scale: 1.02 }}>
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              minWidth: isMobile ? '100%' : '120px'
            }}
          >
            Search
          </Button>
        </motion.div>
      </Box>

      {/* Table Section */}
      <Paper sx={{ 
        width: '100%',
        overflow: 'hidden',
        mb: 3,
        bgcolor: darkMode ? 'black.800' : 'background.paper'
      }}>
        <TableContainer sx={{ 
  maxHeight: isMobile ? '70vh' : 'none',
  overflowX: 'auto'
}}>
          <Table stickyHeader aria-label="users table" size={isMobile ? 'small' : 'medium'}>
            <TableHead>
            <TableRow>
    <TableCell sx={{ whiteSpace: 'nowrap', minWidth: '50px' }}>#</TableCell>
    <TableCell sx={{ whiteSpace: 'nowrap', minWidth: '120px' }}>User</TableCell>
    <TableCell sx={{ whiteSpace: 'nowrap', minWidth: '150px' }}>Email</TableCell>
    <TableCell sx={{ whiteSpace: 'nowrap', minWidth: '150px' }}>Department</TableCell>
    <TableCell sx={{ whiteSpace: 'nowrap', minWidth: '100px' }}>Role</TableCell>
    <TableCell sx={{ whiteSpace: 'nowrap', minWidth: '100px' }}>Status</TableCell>
    <TableCell sx={{ whiteSpace: 'nowrap', minWidth: '120px' }}>Join Date</TableCell>
    <TableCell sx={{ whiteSpace: 'nowrap', minWidth: '80px' }}>Actions</TableCell>
  </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={user._id} hover>
                <TableCell sx={{ display: isMobile ? 'table-cell' : 'table-cell' }}>
                  {index + 1}
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ 
                      mr: isMobile ? 1 : 2, 
                      width: 32, 
                      height: 32,
                      bgcolor: darkMode ? 'primary.dark' : 'primary.main'
                    }}>
                      {user.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {isMobile ? user.name.split(' ')[0] : user.name}
                    </Typography>
                  </Box>
                </TableCell>
              
                <TableCell sx={{ display: isMobile ? 'table-cell' : 'table-cell' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: darkMode ? 'primary.light' : 'primary.main' }} />
                    {user.email_id}
                  </Box>
                </TableCell>
              
                <TableCell sx={{ display: isMobile ? 'table-cell' : 'table-cell' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon fontSize="small" sx={{ mr: 1, color: darkMode ? 'secondary.light' : 'secondary.main' }} />
                    {user.department || 'N/A'}
                  </Box>
                </TableCell>
              
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {React.cloneElement(getUserRoleIcon(user.userRole), {
                      sx: { color: darkMode ? 'primary.light' : 'primary.main' }
                    })}
                    <Typography variant="body2" sx={{ ml: 1, display: isMobile ? 'none' : 'block' }}>
                      {getUserRoleLabel(user.userRole)}
                    </Typography>
                  </Box>
                </TableCell>
              
                <TableCell>
                  <Chip {...getStatusChipProps(user.status)} size="small" />
                </TableCell>
              
                <TableCell sx={{ display: isMobile ? 'table-cell' : 'table-cell' }}>
                  {user.registered_at}
                </TableCell>
              
                <TableCell>
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuClick(e, user)}
                    sx={{
                      color: darkMode ? 'text.secondary' : '#607080',
                      "&:hover": {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Results Count */}
      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
        Showing {filteredUsers.length} of {users.length} users
      </Typography>

      {/* Add User Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: darkMode ? 'black.800' : 'background.paper'
          },
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 600,
          pb: 1,
        }}>
          Add New User
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newUser.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email_id"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email_id}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="department"
            label="Department"
            type="text"
            fullWidth
            variant="outlined"
            value={newUser.department}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>User Role</InputLabel>
            <Select
              name="userRole"
              value={newUser.userRole}
              onChange={handleInputChange}
              label="User Role"
            >
              {["member", "club_admin", "board_admin", "super_admin"].map(
                (option) => (
                  <MenuItem key={option} value={option}>
                    {option === "club_admin"
                      ? "Club Admin"
                      : option === "board_admin"
                      ? "Board Admin"
                      : option === "super_admin"
                      ? "Super Admin"
                      : "Member"}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={newUser.status}
              onChange={handleInputChange}
              label="Status"
            >
              {["active", "banned"].map((option) => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="registered_at"
            label="Join Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newUser.registered_at}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            variant="outlined"
            sx={{
              borderColor: darkMode ? 'grey.600' : '#4776E6',
              color: darkMode ? 'text.primary' : '#4776E6',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: darkMode ? 'black.800' : 'background.paper'
          },
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 600,
          pb: 1,
        }}>
          Edit User
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {editUser && (
            <>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Full Name"
                type="text"
                fullWidth
                variant="outlined"
                value={editUser.name}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                name="email_id"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={editUser.email_id}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                name="department"
                label="Department"
                type="text"
                fullWidth
                variant="outlined"
                value={editUser.department || ""}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel>User Role</InputLabel>
                <Select
                  name="userRole"
                  value={editUser.userRole}
                  onChange={handleEditInputChange}
                  label="User Role"
                >
                  {["member", "club_admin", "board_admin", "super_admin"].map(
                    (option) => (
                      <MenuItem key={option} value={option}>
                        {option === "club_admin"
                          ? "Club Admin"
                          : option === "board_admin"
                          ? "Board Admin"
                          : option === "super_admin"
                          ? "Super Admin"
                          : "Member"}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={editUser.status}
                  onChange={handleEditInputChange}
                  label="Status"
                >
                  {["active", "banned"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                name="registered_at"
                label="Join Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={editUser.registered_at}
                onChange={handleEditInputChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setOpenEditDialog(false)} 
            variant="outlined"
            sx={{
              borderColor: darkMode ? 'grey.600' : '#4776E6',
              color: darkMode ? 'text.primary' : '#4776E6',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: darkMode ? 'black.800' : 'background.paper',
            boxShadow: darkMode 
              ? '0 6px 16px rgba(0, 0, 0, 0.3)' 
              : '0 6px 16px rgba(95, 150, 230, 0.15)',
            mt: 0.5,
          },
        }}
      >
        <MenuItem onClick={handleEdit} sx={{ py: 1 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: 'primary.main' }} />
          </ListItemIcon>
          <ListItemText
            primary="Edit"
            primaryTypographyProps={{
              sx: { color: 'text.primary', fontWeight: 500 },
            }}
          />
        </MenuItem>
        {selectedUser?.status === "active" ? (
          <MenuItem onClick={handleBan} sx={{ py: 1 }}>
            <ListItemIcon>
              <BlockIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="Ban User"
              primaryTypographyProps={{
                sx: { color: 'error.main', fontWeight: 500 },
              }}
            />
          </MenuItem>
        ) : (
          <MenuItem onClick={handleUnban} sx={{ py: 1 }}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="Unban User"
              primaryTypographyProps={{
                sx: { color: 'success.main', fontWeight: 500 },
              }}
            />
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ py: 1 }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText
            primary="Delete"
            primaryTypographyProps={{
              sx: { color: 'error.main', fontWeight: 500 },
            }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Users;