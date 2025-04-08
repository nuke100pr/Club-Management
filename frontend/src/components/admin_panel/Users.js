import { 
  useState, 
  useEffect 
} from 'react';
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
  InputAdornment
} from '@mui/material';
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
  Groups as GroupsIcon
} from '@mui/icons-material';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email_id: '',
    department: '',
    status: 'active',
    userRole: 'member',
    registered_at: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/users/users/');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to mock data if API fails
        const mockUsers = [
          {
            _id: '1',
            name: 'Rahul Sharma',
            email_id: 'rahul@college.edu',
            department: 'Computer Science',
            status: 'active',
            userRole: 'member',
            registered_at: '2020-08-15'
          },
          {
            _id: '2',
            name: 'Priya Patel',
            email_id: 'priya@college.edu',
            department: 'Electrical Engineering',
            status: 'active',
            userRole: 'club_admin',
            registered_at: '2021-01-10'
          },
          {
            _id: '3',
            name: 'Vikram Singh',
            email_id: 'vikram@college.edu',
            department: 'Mechanical Engineering',
            status: 'banned',
            userRole: 'member',
            registered_at: '2020-11-22'
          },
        ];
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
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
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/users/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      const addedUser = await response.json();
      
      // Refresh user list
      const updatedUsers = [...users, addedUser];
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      // Close dialog and reset form
      setOpenDialog(false);
      setNewUser({
        name: '',
        email_id: '',
        department: '',
        status: 'active',
        userRole: 'member',
        registered_at: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding user:', error);
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

  const handleEdit = async () => {
    // Set up edit dialog with selected user data
    setEditUser({...selectedUser});
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/users/${editUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUser),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Update users list with edited user
      const updatedUsers = users.map(user => 
        user._id === editUser._id ? editUser : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      // Close dialog
      setOpenEditDialog(false);
      setEditUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/users/${selectedUser._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      const updatedUsers = users.filter(user => user._id !== selectedUser._id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      handleMenuClose();
    }
  };

  const handleBan = async () => {
    try {
      const updatedUserData = { ...selectedUser, status: 'banned' };
      
      const response = await fetch(`http://localhost:5000/users/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!response.ok) {
        throw new Error('Failed to ban user');
      }

      const updatedUsers = users.map(user => 
        user._id === selectedUser._id ? { ...user, status: 'banned' } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      handleMenuClose();
    }
  };

  const handleUnban = async () => {
    try {
      const updatedUserData = { ...selectedUser, status: 'active' };
      
      const response = await fetch(`http://localhost:5000/users/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!response.ok) {
        throw new Error('Failed to unban user');
      }

      const updatedUsers = users.map(user => 
        user._id === selectedUser._id ? { ...user, status: 'active' } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error('Error unbanning user:', error);
    } finally {
      handleMenuClose();
    }
  };

  const getUserRoleIcon = (role) => {
    switch(role) {
      case 'super_admin':
        return <AdminPanelSettingsIcon fontSize="small" color="primary" />;
      case 'board_admin':
        return <SupervisedUserCircleIcon fontSize="small" color="secondary" />;
      case 'club_admin':
        return <GroupsIcon fontSize="small" color="action" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  const getUserRoleLabel = (role) => {
    switch(role) {
      case 'super_admin':
        return 'Super Admin';
      case 'board_admin':
        return 'Board Admin';
      case 'club_admin':
        return 'Club Admin';
      default:
        return 'Member';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6a1b9a' }}>
          User Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ 
            backgroundColor: '#6a1b9a',
            '&:hover': { backgroundColor: '#4a148c' }
          }}
        >
          Add New User
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ display: 'flex', mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users by name, email, department, role or status"
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
            backgroundColor: '#6a1b9a',
            '&:hover': { backgroundColor: '#4a148c' },
            minWidth: '100px'
          }}
        >
          Search
        </Button>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f3e5f5' }}>
              <TableRow>
                <TableCell width="50px">#</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#6a1b9a', mr: 2 }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      {user.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: '#6a1b9a'
                        }
                      }}
                      onClick={() => handleEmailClick(user.email_id)}
                    >
                      <EmailIcon sx={{ mr: 1, color: '#6a1b9a' }} fontSize="small" />
                      {user.email_id}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ mr: 1, color: '#6a1b9a' }} fontSize="small" />
                      {user.department || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getUserRoleIcon(user.userRole)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {getUserRoleLabel(user.userRole)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status === 'active' ? 'Active' : 'Banned'} 
                      size="small" 
                      sx={{ 
                        backgroundColor: user.status === 'active' ? '#e8f5e9' : '#ffebee',
                        color: user.status === 'active' ? '#2e7d32' : '#c62828'
                      }} 
                    />
                  </TableCell>
                  <TableCell>{user.registered_at}</TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuClick(e, user)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Results Count */}
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: '#f9f9f9' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'}
            {filteredUsers.length !== users.length && ` (filtered from ${users.length} total)`}
          </Typography>
        </Box>
      </Paper>

      {/* Add User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
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
          <TextField
            margin="dense"
            name="userRole"
            label="User Role"
            type="text"
            fullWidth
            select
            SelectProps={{ native: true }}
            variant="outlined"
            value={newUser.userRole}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          >
            {['member', 'club_admin', 'board_admin', 'super_admin'].map((option) => (
              <option key={option} value={option}>
                {option === 'club_admin' ? 'Club Admin' : 
                 option === 'board_admin' ? 'Board Admin' : 
                 option === 'super_admin' ? 'Super Admin' : 'Member'}
              </option>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="status"
            label="Status"
            type="text"
            fullWidth
            select
            SelectProps={{ native: true }}
            variant="outlined"
            value={newUser.status}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          >
            {['active', 'banned'].map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </TextField>
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
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#6a1b9a' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ 
              backgroundColor: '#6a1b9a',
              '&:hover': { backgroundColor: '#4a148c' }
            }}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
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
                value={editUser.department || ''}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                name="userRole"
                label="User Role"
                type="text"
                fullWidth
                select
                SelectProps={{ native: true }}
                variant="outlined"
                value={editUser.userRole}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {['member', 'club_admin', 'board_admin', 'super_admin'].map((option) => (
                  <option key={option} value={option}>
                    {option === 'club_admin' ? 'Club Admin' : 
                     option === 'board_admin' ? 'Board Admin' : 
                     option === 'super_admin' ? 'Super Admin' : 'Member'}
                  </option>
                ))}
              </TextField>
              <TextField
                margin="dense"
                name="status"
                label="Status"
                type="text"
                fullWidth
                select
                SelectProps={{ native: true }}
                variant="outlined"
                value={editUser.status}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {['active', 'banned'].map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </TextField>
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
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} sx={{ color: '#6a1b9a' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            sx={{ 
              backgroundColor: '#6a1b9a',
              '&:hover': { backgroundColor: '#4a148c' }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
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
        {selectedUser?.status === 'active' ? (
          <MenuItem onClick={handleBan}>
            <ListItemIcon>
              <BlockIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Ban User</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleUnban}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'success.main' }}>Unban User</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Users;