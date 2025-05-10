import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Box,
} from '@mui/material';
import { green, blue, grey, indigo } from '@mui/material/colors';
import { getAuthToken } from "@/utils/auth";

export default function BoardPrivileges({ boardId }) {
  const [privileges, setPrivileges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  useEffect(() => {
    const fetchPrivileges = async () => {
      if (!authToken) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/misc/misc/board/${boardId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setPrivileges(data);
        } else {
          throw new Error(data.message || 'Failed to fetch privileges');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchPrivileges();
    }
  }, [boardId, authToken]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={256}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!privileges || !privileges.data.users || privileges.data.users.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Info</AlertTitle>
        No privileges found for this board
      </Alert>
    );
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return { bgcolor: green[100], color: green[800] };
      case 'moderator':
        return { bgcolor: blue[100], color: blue[800] };
      default:
        return { bgcolor: grey[100], color: grey[800] };
    }
  };

  return (
    <Paper elevation={3} sx={{ overflow: 'hidden' }}>
      <Box p={3} borderBottom="1px solid" borderColor="divider">
        <Typography variant="h6" component="h2">
          Board Privileges
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Board ID: {privileges.data.boardId}
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Positions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {privileges.data.users.map((user) => (
              <TableRow 
                key={user.userId} 
                hover 
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: blue[100], color: blue[600], mr: 2 }}>
                      {user.userDetails.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {user.userDetails.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.userDetails.email || 'No email'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.userDetails.userRole}
                    size="small"
                    sx={getRoleColor(user.userDetails.userRole)}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {user.positions.map((position, index) => (
                      <Chip
                        key={index}
                        label={position}
                        size="small"
                        sx={{ bgcolor: indigo[100], color: indigo[800] }}
                      />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box 
        p={2} 
        bgcolor="background.default" 
        borderTop="1px solid" 
        borderColor="divider"
      >
        <Typography variant="caption" color="text.secondary">
          Showing {privileges.data.users.length} user{privileges.data.users.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Paper>
  );
}