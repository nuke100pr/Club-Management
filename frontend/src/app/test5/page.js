// pages/events.js
"use client";

import { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, CardActions, Typography, Button,
  Chip, Box, IconButton, Tooltip, Skeleton
} from '@mui/material';
import { Edit, Delete, Event, AccessTime, LocationOn, Timer, People } from '@mui/icons-material';

const mockEvents = [
  {
    id: 1,
    image: '/event1.jpg',
    title: 'Introduction to AI and Machine Learning with real-world examples',
    description: 'Explore how AI is changing the world. Join us for a session filled with insights, demos, and Q&A.',
    date: '2025-04-15',
    time: '4:00 PM',
    venue: 'Auditorium A',
    duration: '2h',
    eventType: 'Session',
    registrations: 42,
    hasPermission: true
  },
  {
    id: 2,
    image: '/event2.jpg',
    title: 'HackBattle 2025',
    description: 'A 24-hour hackathon that challenges your creativity and coding skills. Prizes worth ₹1L+!',
    date: '2025-04-20',
    time: '9:00 AM',
    venue: 'Main Hall',
    duration: '24h',
    eventType: 'Competition',
    registrations: 128,
    hasPermission: false
  }
];

export default function EventsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const skeletonArray = Array(3).fill(0);

  return (
    <Box sx={{ backgroundColor: '#f8faff', minHeight: '100vh', p: 4 }}>
      <Grid container spacing={3}>
        {(loading ? skeletonArray : mockEvents).map((event, idx) => (
          <Grid item xs={12} sm={6} md={4} key={loading ? idx : event.id}>
            <Card
              elevation={3}
              sx={{
                borderRadius: '16px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': !loading && {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(95, 150, 230, 0.2)'
                },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%'
              }}
            >
              {loading ? (
                <Skeleton variant="rectangular" height={180} sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} />
              ) : (
                <Box
                  sx={{
                    height: 180,
                    backgroundImage: `url(${event.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                  }}
                />
              )}

              <CardContent sx={{ p: 3 }}>
                {loading ? (
                  <>
                    <Skeleton variant="text" height={30} width="90%" />
                    <Skeleton variant="text" height={20} width="100%" />
                    <Skeleton variant="text" height={20} width="80%" />
                    <Box sx={{ mt: 2 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} variant="text" height={20} width={`${80 - i * 10}%`} sx={{ mb: 0.5 }} />
                      ))}
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Skeleton variant="rectangular" width={60} height={22} />
                        <Skeleton variant="rectangular" width={100} height={22} />
                      </Box>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" fontWeight={600} sx={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      mt: 1,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {event.description}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Event sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                        <Typography variant="body2">{event.date}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <AccessTime sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                        <Typography variant="body2">{event.time}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <LocationOn sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                        <Typography variant="body2">{event.venue}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Timer sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                        <Typography variant="body2">{event.duration}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip size="small" label={event.eventType} color="secondary" />
                        <Chip size="small" label={`${event.registrations} registrations`} icon={<People />} sx={{ fontSize: '0.7rem' }} />
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>

              <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
                {loading ? (
                  <Skeleton variant="rectangular" height={36} width={60} />
                ) : (
                  <Box>
                    {event.hasPermission && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton color="primary">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                )}

                {loading ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton variant="rectangular" height={36} width={130} />
                    <Skeleton variant="rectangular" height={36} width={90} />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: 'none', fontWeight: 500 }}
                    >
                      View Registrations
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        background: 'linear-gradient(to right, #4776E6, #8E54E9)',
                        boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(to right, #3a5fc0, #7a42d8)',
                          boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Register
                    </Button>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
