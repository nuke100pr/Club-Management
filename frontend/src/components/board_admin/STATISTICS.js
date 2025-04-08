import { useState, useEffect } from 'react';
import { 
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const CountText = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
}));

const BoardDashboard = ({ boardId }) => {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoardCounts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/misc/misc/board/${boardId}/counts`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setCounts(data.data.counts);
        } else {
          throw new Error(data.message || 'Failed to fetch board counts');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardCounts();
  }, [boardId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 3 }}>
        Error: {error}
      </Alert>
    );
  }

  if (!counts) {
    return (
      <Alert severity="info" sx={{ my: 3 }}>
        No data available for this board
      </Alert>
    );
  }

  const metrics = [
    { name: 'Events', value: counts.events, color: 'primary' },
    { name: 'Posts', value: counts.posts, color: 'secondary' },
    { name: 'Projects', value: counts.projects, color: 'success' },
    { name: 'Opportunities', value: counts.opportunities, color: 'info' },
    { name: 'Resources', value: counts.resources, color: 'warning' },
    { name: 'Blogs', value: counts.blogs, color: 'error' },
    { name: 'Forums', value: counts.forums, color: 'primary' },
    { name: 'Clubs', value: counts.clubs, color: 'secondary' },
  ];

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Board Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Board ID: {boardId}
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <DashboardCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {metric.name}
                </Typography>
                <CountText color={metric.color}>
                  {metric.value}
                </CountText>
              </CardContent>
            </DashboardCard>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default BoardDashboard;