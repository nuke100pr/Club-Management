'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BlogCreateForm from '../../../components/blogs//BlogCreateForm';

// Material UI imports
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button, 
  Chip, 
  CircularProgress, 
  Divider, 
  Alert,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  alpha,
  Stack,
  Avatar
} from '@mui/material';

// Material UI icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Custom theme constants
const themeConstants = {
  colors: {
    primary: {
      main: '#4776E6',
      light: '#6a98ff',
      dark: '#3a5fc0'
    },
    secondary: '#8E54E9',
    background: {
      default: '#f8faff',
      card: '#ffffff',
      sidebar: 'rgba(245, 247, 250, 0.7)'
    },
    text: {
      primary: '#2A3B4F',
      secondary: '#607080'
    },
    gradients: {
      primary: 'linear-gradient(45deg, #4776E6 0%, #8E54E9 100%)'
    },
    shadows: {
      card: '0 4px 12px rgba(95, 150, 230, 0.1)',
      cardHover: '0 12px 20px rgba(95, 150, 230, 0.2)',
      button: '0 4px 10px rgba(71, 118, 230, 0.3)',
      buttonHover: '0 6px 15px rgba(71, 118, 230, 0.4)'
    }
  },
  borderRadius: {
    base: 8,
    card: 16,
    button: 8
  }
};

export default function BlogDetailPage() {
  const { blog_id } = useParams();
  const router = useRouter();
  const theme = useTheme();

  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch blog
  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/blogs/blogs/${blog_id}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [blog_id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const res = await fetch(`http://localhost:5000/blogs/blogs/${blog_id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      alert('Blog deleted successfully!');
      router.push('/blogs'); // Navigate back to blogs page
    } catch (err) {
      setError('Failed to delete the blog: ' + err.message);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.introduction,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing content:', err);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const multipartFormData = new FormData();
      
      // Convert form data to multipart form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags' && Array.isArray(value)) {
          value.forEach((tag, i) => multipartFormData.append(`tags[${i}]`, tag));
        } else if (key === 'image' && value instanceof File) {
          multipartFormData.append('image', value);
        } else {
          multipartFormData.append(key, value);
        }
      });

      const res = await fetch(`http://localhost:5000/blogs/blogs/${blog_id}`, {
        method: 'PUT',
        body: multipartFormData,
      });

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const updatedBlog = await res.json();
      setBlog(updatedBlog);
      setOpenDialog(false);
      setIsEditing(false);
      alert('Blog updated successfully!');
    } catch (err) {
      setError('Failed to update the blog: ' + err.message);
    }
  };

  const handleBack = () => {
    if (document.referrer && document.referrer.includes(window.location.origin)) {
      router.back();
    }
  };

  const handleAllBlogs = () => {
    router.push('/src/app/blogs');
  };

  // Loading, error and empty states
  if (isLoading) return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="80vh"
      sx={{ bgcolor: themeConstants.colors.background.default }}
    >
      <CircularProgress sx={{ color: themeConstants.colors.primary.main }} />
    </Box>
  );
  
  if (error) return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: themeConstants.colors.background.default }}>
      <Alert 
        severity="error"
        sx={{ 
          borderRadius: themeConstants.borderRadius.base,
          boxShadow: themeConstants.colors.shadows.card
        }}
      >
        Error: {error}
      </Alert>
    </Container>
  );
  
  if (!blog) return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: themeConstants.colors.background.default }}>
      <Typography variant="body1" color={themeConstants.colors.text.secondary}>
        No blog found
      </Typography>
    </Container>
  );

  // Format date properly
  const formattedDate = new Date(blog.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Rich text content styling
  const richTextStyles = {
    '& p': { mb: 2, color: themeConstants.colors.text.primary, fontSize: '1rem', lineHeight: 1.6 },
    '& h1': { 
      fontSize: '1.75rem', 
      mb: 2, 
      mt: 3, 
      fontWeight: 600,
      background: themeConstants.colors.gradients.primary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    '& h2': { 
      fontSize: '1.5rem', 
      mb: 2, 
      mt: 3, 
      fontWeight: 600,
      color: themeConstants.colors.primary.main,
    },
    '& h3': { 
      fontSize: '1.25rem', 
      mb: 2, 
      mt: 3, 
      fontWeight: 600,
      color: themeConstants.colors.primary.dark,
    },
    '& ul, & ol': { pl: 4, mb: 2, color: themeConstants.colors.text.primary },
    '& li': { mb: 1 },
    '& a': { 
      color: themeConstants.colors.primary.main,
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      '&:hover': {
        color: themeConstants.colors.secondary,
        textDecoration: 'underline',
      }
    },
    '& img': { 
      maxWidth: '100%', 
      height: 'auto', 
      my: 2,
      borderRadius: themeConstants.borderRadius.base,
      boxShadow: themeConstants.colors.shadows.card,
    },
    '& blockquote': { 
      borderLeft: `4px solid ${themeConstants.colors.primary.light}`, 
      pl: 2, 
      py: 1, 
      my: 2,
      fontStyle: 'italic',
      bgcolor: alpha(themeConstants.colors.primary.main, 0.05),
      borderRadius: '0 8px 8px 0' 
    }
  };

  return (
    <Box sx={{ 
      bgcolor: themeConstants.colors.background.default,
      minHeight: '100vh',
      pb: 8
    }}>
      {/* Full width hero image section with buttons */}
      <Box sx={{ width: '100%', height: { xs: '300px', md: '500px' }, position: 'relative', mb: 0 }}>
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(http://localhost:5000/uploads/${blog?.image?.filename})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)',
            }
          }}
        >
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ 
              position: 'absolute',
              top: 16,
              left: 16,
              background: themeConstants.colors.gradients.primary,
              boxShadow: themeConstants.colors.shadows.button,
              borderRadius: themeConstants.borderRadius.button,
              textTransform: 'none',
              fontWeight: 500,
              py: 1,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: themeConstants.colors.shadows.buttonHover,
                transform: 'translateY(-2px)'
              }
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleAllBlogs}
            sx={{ 
              position: 'absolute',
              top: 16,
              right: 16,
              background: themeConstants.colors.gradients.primary,
              boxShadow: themeConstants.colors.shadows.button,
              borderRadius: themeConstants.borderRadius.button,
              textTransform: 'none',
              fontWeight: 500,
              py: 1,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: themeConstants.colors.shadows.buttonHover,
                transform: 'translateY(-2px)'
              }
            }}
          >
            All Blogs
          </Button>
        </Box>
      </Box>

      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: { xs: -4, md: -6 },
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Title Card */}
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: themeConstants.borderRadius.card,
            boxShadow: themeConstants.colors.shadows.card,
            mb: 4,
            overflow: 'visible',
            transition: 'all 0.3s ease',
            p: { xs: 3, md: 4 },
            bgcolor: 'white',
            '&:hover': {
              boxShadow: themeConstants.colors.shadows.cardHover,
            }
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              color: themeConstants.colors.text.primary,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              mb: 2
            }}
          >
            {blog.title}
          </Typography>

          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center" 
            sx={{ 
              mb: 3,
              color: themeConstants.colors.text.secondary,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar 
                sx={{ 
                  width: 28, 
                  height: 28, 
                  bgcolor: themeConstants.colors.primary.main,
                  fontSize: '0.875rem'
                }}
              >
                <PersonIcon fontSize="small" />
              </Avatar>
              <Typography variant="body2" fontWeight={500}>
                {blog.published_by || 'Anonymous'}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">{formattedDate}</Typography>
            </Stack>
          </Stack>

          {/* Blog metadata */}
          <Paper 
            elevation={0}
            sx={ { 
              p: 2, 
              mb: 3, 
              borderRadius: themeConstants.borderRadius.base,
              bgcolor: alpha(themeConstants.colors.primary.main, 0.05),
              border: `1px solid ${alpha(themeConstants.colors.primary.main, 0.1)}`,
            }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              divider={<Divider orientation="vertical" flexItem />}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <VisibilityIcon fontSize="small" sx={{ color: themeConstants.colors.primary.main }} />
                <Typography variant="body2">{blog.number_of_views} views</Typography>
              </Stack>
              
              {blog.club_id && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PeopleIcon fontSize="small" sx={{ color: themeConstants.colors.secondary }} />
                  <Typography variant="body2">Club: {blog.club_id}</Typography>
                </Stack>
              )}
              
              {blog.board_id && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DashboardIcon fontSize="small" sx={{ color: themeConstants.colors.primary.dark }} />
                  <Typography variant="body2">Board: {blog.board_id}</Typography>
                </Stack>
              )}
            </Stack>
          </Paper>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {blog.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    size="small"
                    sx={{ 
                      my: 0.5, 
                      borderRadius: '12px',
                      bgcolor: alpha(themeConstants.colors.primary.main, 0.1),
                      color: themeConstants.colors.primary.dark,
                      fontSize: '0.65rem',
                      height: '22px',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: alpha(themeConstants.colors.primary.main, 0.2),
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Card>

        {/* Blog content sections */}
        <Card 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 4, 
            borderRadius: themeConstants.borderRadius.card,
            boxShadow: themeConstants.colors.shadows.card,
            '&:hover': {
              boxShadow: themeConstants.colors.shadows.cardHover,
            },
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: themeConstants.colors.gradients.primary
            }
          }}
        >
          {/* Introduction */}
          {blog.introduction && (
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  background: themeConstants.colors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  mb: 2
                }}
              >
                Introduction
              </Typography>
              <Box 
                dangerouslySetInnerHTML={{ __html: blog.introduction }} 
                sx={richTextStyles}
              />
            </Box>
          )}
          
          {/* Main Content */}
          {blog.main_content && (
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  background: themeConstants.colors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  mb: 2
                }}
              >
                Main Content
              </Typography>
              <Box 
                dangerouslySetInnerHTML={{ __html: blog.main_content }} 
                sx={richTextStyles}
              />
            </Box>
          )}
          
          {/* Conclusion */}
          {blog.conclusion && (
            <Box sx={{ mb: 0 }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  background: themeConstants.colors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  mb: 2
                }}
              >
                Conclusion
              </Typography>
              <Box 
                dangerouslySetInnerHTML={{ __html: blog.conclusion }} 
                sx={richTextStyles}
              />
            </Box>
          )}
        </Card>

        {/* Author info */}
        {blog.author_info && (
          <Card 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: themeConstants.borderRadius.card,
              boxShadow: themeConstants.colors.shadows.card,
              '&:hover': {
                boxShadow: themeConstants.colors.shadows.cardHover,
              },
              transition: 'all 0.3s ease',
              bgcolor: 'white',
              borderLeft: `4px solid ${themeConstants.colors.secondary}`
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: themeConstants.colors.text.primary,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}
            >
              About the Author
            </Typography>
            <Typography 
              variant="body1"
              sx={{ 
                color: themeConstants.colors.text.secondary,
                lineHeight: 1.6
              }}
            >
              {blog.author_info}
            </Typography>
          </Card>
        )}

        {/* Action buttons */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ 
              background: themeConstants.colors.gradients.primary,
              boxShadow: themeConstants.colors.shadows.button,
              borderRadius: themeConstants.borderRadius.button,
              textTransform: 'none',
              fontWeight: 500,
              py: 1,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: themeConstants.colors.shadows.buttonHover,
                transform: 'translateY(-2px)'
              }
            }}
          >
            Edit Blog
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            sx={{ 
              borderRadius: themeConstants.borderRadius.button,
              textTransform: 'none',
              fontWeight: 500,
              py: 1,
              transition: 'all 0.3s ease',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 10px rgba(211, 47, 47, 0.3)'
              }
            }}
          >
            Delete Blog
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            sx={{ 
              color: themeConstants.colors.secondary,
              borderColor: themeConstants.colors.secondary,
              borderRadius: themeConstants.borderRadius.button,
              textTransform: 'none',
              fontWeight: 500,
              py: 1,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: themeConstants.colors.secondary,
                backgroundColor: alpha(themeConstants.colors.secondary, 0.05),
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 10px rgba(142, 84, 233, 0.2)'
              }
            }}
          >
            Share
          </Button>
        </Stack>
      </Container>

      {/* Blog Create Form Dialog for editing - unchanged functionality */}
      <BlogCreateForm
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setIsEditing(false);
        }}
        onSubmit={handleFormSubmit}
        initialData={
          blog
            ? {
                title: blog.title,
                publisher: blog.published_by,
                introduction: blog.introduction,
                mainContent: blog.main_content,
                conclusion: blog.conclusion,
                authorInfo: blog.author_info,
                tags: blog.tags,
                image: blog.image,
              }
            : null
        }
        club_id={blog?.club_id}
        board_id={blog?.board_id}
      />
    </Box>
  );
}

