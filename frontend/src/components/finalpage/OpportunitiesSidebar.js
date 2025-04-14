import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Avatar, Button, CircularProgress,
  alpha, useTheme
} from '@mui/material';
import { WorkOutline as WorkOutlineIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const OpportunitiesSidebar = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [opportunitiesError, setOpportunitiesError] = useState(null);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setOpportunitiesLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/opportunities`);
        if (!response.ok) throw new Error('Failed to fetch opportunities');

        const result = await response.json();
        // Get only 3 most recent opportunities
        const sortedOpportunities = (result.data || result)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        setOpportunities(sortedOpportunities);
        setOpportunitiesLoading(false);
      } catch (error) {
        console.error('Failed to fetch opportunities:', error);
        setOpportunitiesError(error.message);
        setOpportunitiesLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  return (
    <Box
      sx={{
        height: '100%', // Changed from 48% to 100%
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '0px', // Hide scrollbar but keep functionality
          background: 'transparent'
        }
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: 700,
          color: 'text.primary',
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 1,
          py: 1,
        }}
      >
        <WorkOutlineIcon sx={{ mr: 1, color: 'secondary.main' }} />
        Opportunities
      </Typography>

      {opportunitiesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : opportunitiesError ? (
        <Typography variant="caption" color="error">
          Failed to load opportunities
        </Typography>
      ) : opportunities.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          No opportunities available
        </Typography>
      ) : (
        <Box sx={{ flexGrow: 1 }}>
          {opportunities.map((opportunity) => (
            <Card
              key={opportunity._id}
              sx={{
                mb: 2,
                p: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 4px 12px rgba(95, 150, 230, 0.2)',
                },
                cursor: 'pointer',
                '&:active': {
                  transform: 'translateY(0)',
                }
              }}
              onClick={() => window.open(opportunity.external_link, '_blank')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  src={opportunity.postedBy?.avatar || "/default-avatar.jpg"}
                  alt={opportunity.postedBy?.name || "Posted by"}
                  sx={{ width: 30, height: 30 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  Posted by: {opportunity.postedBy?.name || "Organization"}
                </Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                {opportunity.title}
              </Typography>

              <Button
                variant="contained"
                size="small"
                fullWidth
                sx={{
                  background: 'linear-gradient(45deg, #4776E6 0%, #8E54E9 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #3a5fc0 0%, #7843c4 100%)',
                  },
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(71, 118, 230, 0.3)',
                }}
              >
                Apply Now
              </Button>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default OpportunitiesSidebar;