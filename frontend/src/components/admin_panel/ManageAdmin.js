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

export default function AdminManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [boards, setBoards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    role: 'club_admin',
    club_id: '',
    board_id: ''
  });
  const [loading, setLoading] = useState({
    users: true,
    clubs: true,
    boards: true
  });
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

        const usersPromise = fetch('http://localhost:5000/users/users')
          .then(res => res.json())
          .then(data => {
            setUsers(data);
            setLoading(prev => ({ ...prev, users: false }));
            return data;
          });

        const clubsPromise = fetch('http://localhost:5000/clubs/clubs')
          .then(res => res.json())
          .then(data => {
            setClubs(data);
            setLoading(prev => ({ ...prev, clubs: false }));
            return data;
          });

        const boardsPromise = fetch('http://localhost:5000/boards')
          .then(res => res.json())
          .then(data => {
            setBoards(data);
            setLoading(prev => ({ ...prev, boards: false }));
            return data;
          });

        const [usersData] = await Promise.all([usersPromise, clubsPromise, boardsPromise]);

        const admins = usersData.filter(user => 
          user.userRole === 'club_admin' || user.userRole === 'board_admin'
        );
        setFilteredUsers(admins);
      } catch (error) {
        console.error('Error loading data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load data',
          severity: 'error'
        });
        setLoading({ users: false, clubs: false, boards: false });
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    console.log(formData);
  }, [formData])
  

  const handleOpenDialog = () => {
    setFormData({
      userId: '',
      role: 'club_admin',
      club_id: '',
      board_id: ''
    });
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
      const endpoint = formData.role === 'club_admin' 
        ? '/users/assign-club-admin' 
        : '/users/assign-board-admin';

        
      
      const requestBody = {
        userId: formData.userId,
        ...(formData.role === 'club_admin' 
          ? { club_id: formData.club_id }
          : { board_id: formData.board_id })
      };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign admin role');
      }

      const updatedUser = await response.json();
      
      setUsers(prev => prev.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      
      setFilteredUsers(prev => [...prev, updatedUser]);

      setSnackbar({
        open: true,
        message: `Successfully assigned ${formData.role.replace('_', ' ')} role`,
        severity: 'success'
      });
      setOpenDialog(false);
    } catch (error) {
      console.error('Error assigning admin role:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to assign admin role',
        severity: 'error'
      });
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/remove-admin/${selectedUser._id}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove admin role');
      }

      const updatedUser = await response.json();
      
      setUsers(prev => prev.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      
      setFilteredUsers(prev => prev.filter(user => user._id !== selectedUser._id));

      setSnackbar({
        open: true,
        message: 'Successfully removed admin role',
        severity: 'success'
      });
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error removing admin role:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to remove admin role',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const regularMembers = users.filter(user => user.userRole === 'member');

  const isLoading = loading.users || loading.clubs || loading.boards;

  return (
    <Container maxWidth="lg" sx={{ p: isMobile ? 1 : 3 }}>
      <Box sx={{ my: 4 }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
          Admin Management
        </Typography>
        
        {isLoading ? (
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
                Assign New Admin
              </Button>
            )}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Assigned To</TableCell>
                    {currentUser?.isSuperAdmin && <TableCell>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email_id}</TableCell>
                        <TableCell>
                          {user.userRole === 'club_admin' ? 'Club Admin' : 'Board Admin'}
                        </TableCell>
                        <TableCell>{user.department || 'N/A'}</TableCell>
                        <TableCell>
                          {user.userRole === 'club_admin' 
                            ? clubs.find(c => c._id === user.club_id)?.name || 'N/A'
                            : boards.find(b => b._id === user.board_id)?.name || 'N/A'}
                        </TableCell>
                        {currentUser?.isSuperAdmin && (
                          <TableCell>
                            <IconButton 
                              color="error" 
                              onClick={() => handleOpenDeleteDialog(user)}
                              disabled={user._id === currentUser.userId}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={currentUser?.isSuperAdmin ? 6 : 5} align="center">
                        No admin users found
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
        <DialogTitle>Assign Admin Role</DialogTitle>
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
                {regularMembers.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.email_id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Admin Type</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                required
              >
                <MenuItem value="club_admin">Club Admin</MenuItem>
                <MenuItem value="board_admin">Board Admin</MenuItem>
              </Select>
            </FormControl>

            {formData.role === 'club_admin' ? (
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Club</InputLabel>
                <Select
                  name="club_id"
                  value={formData.club_id}
                  onChange={handleFormChange}
                  required
                >
                  {clubs.map(club => (
                    <MenuItem key={club._id} value={club._id}>
                      {club.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Board</InputLabel>
                <Select
                  name="board_id"
                  value={formData.board_id}
                  onChange={handleFormChange}
                  required
                >
                  {boards.map(board => (
                    <MenuItem key={board._id} value={board._id}>
                      {board.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
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
            >
              Assign Role
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} fullScreen={isMobile}>
        <DialogTitle>Remove Admin Role</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {selectedUser?.name}'s admin privileges?
            {selectedUser?._id === currentUser?.userId && (
              <Typography color="error" mt={1}>
                Warning: You are removing your own admin privileges!
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} sx={{ color: '#6a1b9a' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAdmin} 
            variant="contained"
            sx={{ 
              backgroundColor: '#d32f2f',
              '&:hover': { backgroundColor: '#9a0007' }
            }}
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