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

const DashboardCard = styled(Card)(({ theme, color }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  borderTop: `3px solid ${theme.palette[color]?.main || theme.palette.primary.main}`,
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(95, 150, 230, 0.1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(95, 150, 230, 0.2)',
  },
}));

const CountText = styled(Typography)(({ theme, color }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  background: color === 'primary' 
    ? 'linear-gradient(to right, #4776E6, #8E54E9)'
    : `linear-gradient(to right, ${theme.palette[color]?.light || theme.palette.primary.light}, ${theme.palette[color]?.main || theme.palette.primary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  background: 'linear-gradient(to right, #4776E6, #8E54E9)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const BoardDashboard = ({ clubId }) => {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoardCounts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/misc/misc/club/${clubId}/counts`);
        
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
  }, [clubId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress size={60} sx={{ color: '#4776E6' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 3, borderRadius: '8px' }}>
        Error: {error}
      </Alert>
    );
  }

  if (!counts) {
    return (
      <Alert severity="info" sx={{ my: 3, borderRadius: '8px' }}>
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
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(95, 150, 230, 0.1)'
      }}
    >
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <DashboardCard color={metric.color}>
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, color: '#2A3B4F' }}>
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