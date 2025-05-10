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
import { styled } from '@mui/material/styles';
import { getAuthToken } from "@/utils/auth";

// Custom styled components to match the design system
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(95, 150, 230, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 20px rgba(95, 150, 230, 0.2)',
    transform: 'translateY(-4px)',
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  background: 'white',
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  background: 'linear-gradient(45deg, #4776E6, #8E54E9)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableRow-root': {
    backgroundColor: '#f8faff',
  },
  '& .MuiTableCell-root': {
    fontWeight: 600,
    color: '#2A3B4F',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4776E6 30%, #8E54E9 90%)',
  color: 'white',
  marginRight: theme.spacing(2),
}));

const StyledChip = styled(Chip)(({ theme, colorscheme }) => {
  // Define color schemes based on role
  const colorSchemes = {
    admin: {
      bgcolor: 'rgba(56, 142, 60, 0.1)',
      color: '#388e3c',
    },
    moderator: {
      bgcolor: 'rgba(25, 118, 210, 0.1)',
      color: '#1976d2',
    },
    default: {
      bgcolor: 'rgba(96, 112, 128, 0.1)',
      color: '#607080',
    },
    position: {
      bgcolor: 'rgba(123, 31, 162, 0.1)',
      color: '#7b1fa2',
    },
  };

  const scheme = colorSchemes[colorscheme] || colorSchemes.default;

  return {
    height: 22,
    fontSize: '0.65rem',
    fontWeight: 500,
    borderRadius: 8,
    ...scheme,
    '&:hover': {
      ...scheme,
      filter: 'brightness(0.95)',
    },
  };
});

const FooterBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f8faff',
  borderTop: '1px solid',
  borderColor: theme.palette.divider,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(71, 118, 230, 0.02)',
  },
}));

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

  console.log(boardId);

  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        if (!authToken) {
          return;
        }

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
        console.log(data);
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
      <Box display="flex" justifyContent="center" alignItems="center" height={256} sx={{ color: '#4776E6' }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!privileges || !privileges.data.users || privileges.data.users.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
        <AlertTitle>Info</AlertTitle>
        No privileges found for this board
      </Alert>
    );
  }

  return (
    <StyledPaper elevation={0}>      
      <TableContainer>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Positions</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {privileges.data.users.map((user) => (
              <StyledTableRow 
                key={user.userId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <StyledAvatar>
                      {user.userDetails.name.charAt(0).toUpperCase()}
                    </StyledAvatar>
                    <Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500, 
                          color: '#2A3B4F',
                          fontFamily: '"Inter", sans-serif'
                        }}
                      >
                        {user.userDetails.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#607080',
                          fontFamily: '"Inter", sans-serif'
                        }}
                      >
                        {user.userDetails.email || 'No email'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <StyledChip
                    label={user.userDetails.userRole}
                    size="small"
                    colorscheme={user.userDetails.userRole}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {user.positions.map((position, index) => (
                      <StyledChip
                        key={index}
                        label={position}
                        size="small"
                        colorscheme="position"
                      />
                    ))}
                  </Box>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <FooterBox>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#607080',
            fontFamily: '"Inter", sans-serif'
          }}
        >
          Showing {privileges.data.users.length} user{privileges.data.users.length !== 1 ? 's' : ''}
        </Typography>
      </FooterBox>
    </StyledPaper>
  );
}
