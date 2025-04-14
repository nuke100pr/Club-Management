import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Grid, 
  Chip,
  Button,
  IconButton,
  Stack,
  Container,
  Avatar
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  boxShadow: '0 4px 12px rgba(95, 150, 230, 0.1)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(95, 150, 230, 0.2)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  }
}));

const StyledChip = styled(Chip)(({ theme, colorindex }) => {
  // Array of colors for tags
  const colors = [
    theme.palette.primary.main, // blue
    theme.palette.success.main, // green
    theme.palette.error.main, // red
    theme.palette.secondary.main, // purple
    theme.palette.warning.main, // orange
    theme.palette.info.main, // light blue
  ];
  
  const color = colors[colorindex % colors.length];
  
  return {
    height: 22,
    fontSize: '0.65rem',
    fontWeight: 500,
    backgroundColor: alpha(color, 0.1),
    color: color,
    '&:hover': {
      backgroundColor: alpha(color, 0.2),
    },
    marginRight: theme.spacing(0.75),
    marginBottom: theme.spacing(0.75),
  };
});

const GradientTypography = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  fontWeight: 600,
  marginBottom: theme.spacing(3),
}));

const ViewButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.common.white,
  boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
  },
  textTransform: 'none',
  fontWeight: 500,
}));

// Sample data for demonstration
const sampleBlogs = [
  {
    id: 1,
    title: 'Getting Started with Next.js and Material UI',
    excerpt: 'Learn how to set up a project with Next.js and Material UI to create beautiful, responsive web applications.',
    tags: ['Next.js', 'Material UI', 'Web Development'],
    publisher: 'Jane Doe',
    date: '2025-03-15',
    userCanEdit: true,
  },
  {
    id: 2,
    title: 'The Future of Web Development: AI and Machine Learning Integration',
    excerpt: 'Discover how AI and machine learning are transforming the way we build and interact with web applications.',
    tags: ['AI', 'Machine Learning', 'Future Tech'],
    publisher: 'John Smith',
    date: '2025-03-20',
    userCanEdit: false,
  },
  {
    id: 3,
    title: 'Responsive Design Patterns for Modern Applications',
    excerpt: 'Explore the most efficient responsive design patterns to ensure your applications work flawlessly across all devices.',
    tags: ['UI/UX', 'Responsive', 'Design'],
    publisher: 'Alex Johnson',
    date: '2025-03-25',
    userCanEdit: true,
  },
  {
    id: 4,
    title: 'Building Accessible Web Applications',
    excerpt: 'Learn best practices for creating web applications that are accessible to all users, including those with disabilities.',
    tags: ['Accessibility', 'Inclusive Design', 'WCAG'],
    publisher: 'Sam Wilson',
    date: '2025-03-28',
    userCanEdit: false,
  },
  {
    id: 5,
    title: 'Performance Optimization Techniques for React Applications',
    excerpt: 'Discover powerful techniques to optimize your React applications for better performance and user experience.',
    tags: ['React', 'Performance', 'Optimization'],
    publisher: 'Taylor Brown',
    date: '2025-04-02',
    userCanEdit: true,
  },
  {
    id: 6,
    title: 'Modern Authentication Strategies for Web Applications',
    excerpt: 'Explore secure authentication methods to protect your users and data in modern web applications.',
    tags: ['Security', 'Authentication', 'JWT'],
    publisher: 'Morgan Lee',
    date: '2025-04-05',
    userCanEdit: false,
  }
];

// Main component
export default function BlogCardGrid() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('https://api.pexels.com/v1/search?query=people&per_page=6', {
          headers: {
            Authorization: 'VMHhzGpq2rC9YSGcg0lsKwcwWiIzmPMmggE7nj3mubVYyzFWUwYGXA5g'
          }
        });
        const data = await response.json();
        setPhotos(data.photos);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching photos:', error);
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleEdit = (id) => {
    console.log(`Edit blog with id: ${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Delete blog with id: ${id}`);
  };

  const handleView = (id) => {
    console.log(`View blog with id: ${id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading images...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <GradientTypography variant="h5" gutterBottom>
        Latest Blog Posts
      </GradientTypography>

      <Grid container spacing={3}>
        {sampleBlogs.map((blog, index) => (
          <Grid item xs={12} sm={6} md={4} key={blog.id}>
            <StyledCard>
              {photos[index] && (
                <CardMedia
                  component="img"
                  height="200"
                  image={photos[index].src.medium}
                  alt={photos[index].photographer}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box mb={1.5}>
                  {blog.tags.slice(0, 3).map((tag, i) => (
                    <StyledChip 
                      key={i} 
                      label={tag} 
                      size="small" 
                      colorindex={i} 
                    />
                  ))}
                </Box>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.3,
                    minHeight: '2.6em'
                  }}
                >
                  {blog.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '3em'
                  }}
                >
                  {blog.excerpt}
                </Typography>
                
                <Stack 
                  direction="row" 
                  spacing={1} 
                  alignItems="center" 
                  mb={2}
                  sx={{ color: 'text.secondary' }}
                >
                  <Avatar 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      bgcolor: (theme) => theme.palette.primary.main,
                      fontSize: '0.75rem'
                    }}
                  >
                    {blog.publisher.charAt(0)}
                  </Avatar>
                  <Typography variant="caption">
                    {blog.publisher}
                  </Typography>
                  <Box sx={{ mx: 0.5, fontSize: '0.5rem' }}>•</Box>
                  <Typography variant="caption">
                    {formatDate(blog.date)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    {blog.userCanEdit && (
                      <>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(blog.id)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(blog.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                  <ViewButton 
                    size="small" 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleView(blog.id)}
                  >
                    View Blog
                  </ViewButton>
                </Stack>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}