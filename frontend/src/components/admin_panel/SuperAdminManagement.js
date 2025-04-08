"use client";
import { useState, useEffect } from 'react';
import { fetchUserData } from '@/utils/auth';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function SuperAdminManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await fetchUserData();
        setCurrentUser(userData);

        const response = await fetch('http://localhost:5000/users/users');
        const data = await response.json();
        setUsers(data);
        
        const admins = data.filter(user => user.userRole === 'super_admin');
        setSuperAdmins(admins);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load user data',
          severity: 'error'
        });
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOpenDialog = () => {
    setFormData({ userId: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestBody = {
        userId: formData.userId
      };

      const response = await fetch('http://localhost:5000/users/assign-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign super admin role');
      }

      const updatedUser = await response.json();
      
      setUsers(prev => prev.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      
      setSuperAdmins(prev => [...prev, updatedUser]);

      setSnackbar({
        open: true,
        message: 'Successfully assigned super admin role',
        severity: 'success'
      });
      setOpenDialog(false);
    } catch (error) {
      console.error('Error assigning super admin role:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to assign super admin role',
        severity: 'error'
      });
    }
  };

  const handleDeleteSuperAdmin = async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/remove-admin/${selectedUser._id}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove super admin role');
      }

      const updatedUser = await response.json();
      
      setUsers(prev => prev.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      
      setSuperAdmins(prev => prev.filter(user => user._id !== selectedUser._id));

      setSnackbar({
        open: true,
        message: 'Successfully removed super admin role',
        severity: 'success'
      });
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error removing super admin role:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to remove super admin role',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const eligibleUsers = users.filter(user => user.userRole !== 'super_admin');

  return (
    <Container maxWidth="lg" sx={{ p: isMobile ? 1 : 3 }}>
      <Box sx={{ my: 4 }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
          Super Admin Management
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {currentUser?.isSuperAdmin && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleOpenDialog}
                sx={{ 
                  mb: 3,
                  backgroundColor: '#6a1b9a',
                  '&:hover': { backgroundColor: '#4a148c' }
                }}
                fullWidth={isMobile}
              >
                Add New Super Admin
              </Button>
            )}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Date Added</TableCell>
                    {currentUser?.isSuperAdmin && <TableCell>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {superAdmins.length > 0 ? (
                    superAdmins.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email_id}</TableCell>
                        <TableCell>{user.department || 'N/A'}</TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        {currentUser?.isSuperAdmin && (
                          <TableCell>
                            <IconButton 
                              color="error" 
                              onClick={() => handleOpenDeleteDialog(user)}
                              disabled={user._id === currentUser.userId || superAdmins.length <= 1}
                              title={
                                user._id === currentUser.userId 
                                  ? "Cannot remove yourself" 
                                  : superAdmins.length <= 1 
                                    ? "Cannot remove the last super admin" 
                                    : "Remove super admin"
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={currentUser?.isSuperAdmin ? 5 : 4} align="center">
                        No super admin users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullScreen={isMobile}>
        <DialogTitle>Assign Super Admin Role</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>User</InputLabel>
              <Select
                name="userId"
                value={formData.userId}
                onChange={handleFormChange}
                required
              >
                {eligibleUsers.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.email_id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} sx={{ color: '#6a1b9a' }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                backgroundColor: '#6a1b9a',
                '&:hover': { backgroundColor: '#4a148c' }
              }}
              disabled={!formData.userId}
            >
              Assign Super Admin Role
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} fullScreen={isMobile}>
        <DialogTitle>Remove Super Admin Role</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {selectedUser?.name}'s super admin privileges?
            {selectedUser?._id === currentUser?.userId && (
              <Typography color="error" mt={1}>
                Warning: You cannot remove your own super admin privileges!
              </Typography>
            )}
            {superAdmins.length <= 1 && (
              <Typography color="error" mt={1}>
                Warning: Cannot remove the last super admin user!
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} sx={{ color: '#6a1b9a' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteSuperAdmin} 
            variant="contained"
            sx={{ 
              backgroundColor: '#d32f2f',
              '&:hover': { backgroundColor: '#9a0007' }
            }}
            disabled={selectedUser?._id === currentUser?.userId || superAdmins.length <= 1}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}