import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography, Box, Card, CardMedia, CircularProgress,
  alpha, useTheme
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads`;

export default function RightSidebar({ userId }) {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const url = userId
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/events?userId=${userId}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/events`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (!result.success) throw new Error(result.message || "Failed to fetch events");

        // Sort events by nearest date first
        const sortedEvents = (result.data || []).sort((a, b) =>
          new Date(a.timestamp) - new Date(b.timestamp)
        );

        setEvents(sortedEvents.slice(0, 3)); // Get only 3 nearest events
        setEventsLoading(false);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEventsError(error.message);
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  const cardBackground = theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.8)
    : theme.palette.background.paper;

  return (
    <Box sx={{ 
      borderLeft: `1px solid ${theme.palette.divider}`,
      height: '100vh', 
      p: 2, 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      '& *::-webkit-scrollbar': {
        display: 'none',
      },
      '& *': {
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      },
      position: 'relative',
      '&:hover': {
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '4px',
          height: '100%',
          backgroundImage: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
          opacity: 0.5,
          borderRadius: '0 4px 4px 0',
        }
      }
    }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: 700,
          color: theme.palette.text.primary,
          position: 'sticky',
          top: 0,
          backgroundColor: theme.palette.background.default,
          zIndex: 1,
          py: 1,
          backgroundImage: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        <EventIcon sx={{ mr: 1, color: '#4776E6' }} />
        Upcoming Events
      </Typography>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '0px',
            background: 'transparent'
          },
        }}
      >
        {eventsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ color: '#8E54E9' }} />
          </Box>
        ) : eventsError ? (
          <Typography variant="caption" color="error">
            Failed to load events
          </Typography>
        ) : events.length === 0 ? (
          <Typography variant="caption" color={theme.palette.text.secondary}>
            No upcoming events
          </Typography>
        ) : (
          events.map((event) => (
            <Card
              key={event._id}
              sx={{
                mb: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows[4],
                },
                cursor: 'pointer',
                '&:active': {
                  transform: 'translateY(0)',
                },
                backgroundColor: cardBackground,
                borderLeft: `4px solid`,
                borderImageSlice: 1,
                borderImageSource: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
              }}
              onClick={() => router.push(`/current_event/${event._id}`)}
            >
              <CardMedia
                component="img"
                sx={{
                  width: 45,
                  height: 45,
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
                image={`${API_URL}/${event?.image?.filename}`}
                alt={event.name}
              />
              <Box sx={{ ml: 1.5, flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: theme.palette.text.primary }}>
                  {event.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mr: 1.5,
                      color: theme.palette.text.secondary
                    }}
                  >
                    <EventIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.8rem', color: '#4776E6' }} />
                    {new Date(event.timestamp).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: theme.palette.text.secondary
                    }}
                  >
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.8rem', color: '#8E54E9' }} />
                    {new Date(event.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.text.secondary
                  }}
                >
                  <LocationOnIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.8rem', color: '#f44336' }} />
                  {event.venue}
                </Typography>
              </Box>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}