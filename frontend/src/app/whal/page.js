"use client";
// pages/event.js
import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Chip, 
  Divider, 
  Avatar, 
  TextField, 
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import CategoryIcon from '@mui/icons-material/Category';
import SendIcon from '@mui/icons-material/Send';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

// Create a custom theme for the aesthetic soft look
const theme = createTheme({
  palette: {
    primary: {
      main: '#9c88ff',
      light: '#c4b5fd',
      dark: '#7c3aed',
    },
    secondary: {
      main: '#f5f5f5',
      light: '#ffffff',
      dark: '#e0e0e0',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          padding: '10px 20px',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

// Sample event data
const eventData = {
  id: 1,
  title: "AI Hackathon 2025",
  description: "Join us for an exciting 24-hour hackathon focused on artificial intelligence solutions! Participants will work in teams to develop innovative AI applications that address real-world challenges. Industry experts will be available for mentorship, and prizes will be awarded to the top three teams. Food, drinks, and snacks will be provided throughout the event. Don't miss this opportunity to showcase your skills and network with fellow tech enthusiasts!",
  image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
  duration: "24 hours",
  venue: "Tech Innovation Center, Building A, Floor 3",
  date: "April 15-16, 2025",
  time: "10:00 AM - 10:00 AM (next day)",
  organizer: "AI Club",
  eventType: "Competition",
  comments: [
    {
      id: 1,
      author: "Jane Smith",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      content: "Looking forward to this event! Will beginners be welcome?",
      timestamp: "2 days ago"
    },
    {
      id: 2,
      author: "Mike Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      content: "I participated last year and it was amazing! Highly recommend it to everyone.",
      timestamp: "1 day ago"
    }
  ]
};

export default function EventPage() {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(eventData.comments);
  const theme = useTheme();

  const handleCommentSubmit = () => {
    if (comment.trim() === '') return;
    
    const newComment = {
      id: comments.length + 1,
      author: "You",
      avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
      content: comment,
      timestamp: "Just now"
    };
    
    setComments([...comments, newComment]);
    setComment('');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        py: 8,
        backgroundImage: 'linear-gradient(to bottom, rgba(156, 136, 255, 0.1), rgba(255, 255, 255, 0))',
      }}>
        <Container maxWidth="md">
          <Paper 
            elevation={0} 
            sx={{ 
              overflow: 'hidden', 
              mb: 5,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: theme.shape.borderRadius * 2,
            }}
          >
            <CardMedia
              component="img"
              height="400"
              image={eventData.image}
              alt={eventData.title}
              sx={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />

            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Chip 
                    label={eventData.eventType} 
                    color="primary" 
                    size="small" 
                    sx={{ mb: 2, fontWeight: 600 }}
                  />
                  <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
                    {eventData.title}
                  </Typography>
                </Box>
                <Box>
                  <IconButton color="primary" aria-label="add to favorites">
                    <FavoriteIcon />
                  </IconButton>
                  <IconButton color="primary" aria-label="share">
                    <ShareIcon />
                  </IconButton>
                  <IconButton color="primary" aria-label="bookmark">
                    <BookmarkBorderIcon />
                  </IconButton>
                </Box>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Date</Typography>
                      <Typography variant="subtitle2">{eventData.date}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Time</Typography>
                      <Typography variant="subtitle2">{eventData.time}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Venue</Typography>
                      <Typography variant="subtitle2">{eventData.venue}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Organizer</Typography>
                      <Typography variant="subtitle2">{eventData.organizer}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>About Event</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {eventData.description}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Event Details</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 3, 
                      bgcolor: alpha(theme.palette.primary.light, 0.1),
                      borderRadius: theme.shape.borderRadius * 1.5,
                    }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'primary.dark' }}>
                        <AccessTimeIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                        Duration
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {eventData.duration}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 3, 
                      bgcolor: alpha(theme.palette.primary.light, 0.1),
                      borderRadius: theme.shape.borderRadius * 1.5,
                    }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'primary.dark' }}>
                        <CategoryIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                        Event Type
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {eventData.eventType}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Comments</Typography>

                {comments.map((comment) => (
                  <Box key={comment.id} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Avatar src={comment.avatar} sx={{ mr: 2, width: 40, height: 40 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {comment.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {comment.timestamp}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {comment.content}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}

                <Box sx={{ display: 'flex', mt: 4 }}>
                  <Avatar sx={{ mr: 2, width: 40, height: 40 }}>Y</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Write a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.light, 0.05),
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <Button
                            variant="contained"
                            color="primary"
                            endIcon={<SendIcon />}
                            onClick={handleCommentSubmit}
                            sx={{ 
                              borderRadius: 8,
                              boxShadow: 2,
                              px: 2
                            }}
                          >
                            Post
                          </Button>
                        ),
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained" 
              color="primary"
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontWeight: 600,
                boxShadow: '0 8px 16px rgba(156, 136, 255, 0.2)',
                '&:hover': {
                  boxShadow: '0 12px 20px rgba(156, 136, 255, 0.3)',
                }
              }}
            >
              Register for Event
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}