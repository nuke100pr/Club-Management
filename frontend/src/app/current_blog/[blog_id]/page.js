'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BlogCreateForm from '../../../components/blogs//BlogCreateForm';
import { fetchUserData, hasPermission } from "@/utils/auth";
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
  Avatar,
  IconButton,
  Tooltip
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

export default function BlogDetailPage() {
  const { blog_id } = useParams();
  const router = useRouter();
  const theme = useTheme();

  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [userClubsWithBlogPermission, setUserClubsWithBlogPermission] = useState([]);
  const [userBoardsWithBlogPermission, setUserBoardsWithBlogPermission] = useState([]);
  const [hasPermissionToEdit, setHasPermissionToEdit] = useState(false); 

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

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        // Extract clubs with blogs permission
        if (result.userData?.data?.clubs) {
          const clubsWithPermission = Object.keys(result.userData.data.clubs).filter(
            (clubId) => result.userData.data.clubs[clubId].blogs === true
          );
          setUserClubsWithBlogPermission(clubsWithPermission);

          // Set the first club as default if available
          if (clubsWithPermission.length > 0) {
            setSelectedClubId(clubsWithPermission[0]);
          }
        }

        // Extract boards with blogs permission
        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(result.userData.data.boards).filter(
            (boardId) => result.userData.data.boards[boardId].blogs === true
          );
          setUserBoardsWithBlogPermission(boardsWithPermission);

          // Set the first board as default if available
          if (boardsWithPermission.length > 0) {
            setSelectedBoardId(boardsWithPermission[0]);
          }
        }
      }
    }
    loadUserData();
  }, []);

  // Check permission when blog or userData changes
  useEffect(() => {
    if (blog && userData) {
      const lml = async () => {
        const hasPermission = await hasBlogPermission(blog);
        setHasPermissionToEdit(hasPermission);
      }
    
      lml();
    }
  }, [blog, userData]);

  const hasBlogPermission = (blog) => {
    if (isSuperAdmin) return true;
    if (!userData) return false;
    
    const clubId = blog.club_id?._id || blog.club_id;
    const boardId = blog.board_id?._id || blog.board_id;
    
    return hasPermission("blogs", userData, boardId, clubId);
  };

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

  // Define gradients that will look good in both light and dark themes
  const primaryGradient = `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;
  
  // Loading, error and empty states
  if (isLoading) return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="80vh"
      sx={{ bgcolor: theme.palette.background.default }}
    >
      <CircularProgress sx={{ color: theme.palette.primary.main }} />
    </Box>
  );
  
  if (error) return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: theme.palette.background.default }}>
      <Alert 
        severity="error"
        sx={{ 
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[2]
        }}
      >
        Error: {error}
      </Alert>
    </Container>
  );
  
  if (!blog) return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: theme.palette.background.default }}>
      <Typography variant="body1" color={theme.palette.text.secondary}>
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
    '& p': { mb: 2, color: theme.palette.text.primary, fontSize: '1rem', lineHeight: 1.6 },
    '& h1': { 
      fontSize: '1.75rem', 
      mb: 2, 
      mt: 3, 
      fontWeight: 600,
      background: primaryGradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    '& h2': { 
      fontSize: '1.5rem', 
      mb: 2, 
      mt: 3, 
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
    '& h3': { 
      fontSize: '1.25rem', 
      mb: 2, 
      mt: 3, 
      fontWeight: 600,
      color: theme.palette.primary.dark,
    },
    '& ul, & ol': { pl: 4, mb: 2, color: theme.palette.text.primary },
    '& li': { mb: 1 },
    '& a': { 
      color: theme.palette.primary.main,
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      '&:hover': {
        color: theme.palette.secondary.main,
        textDecoration: 'underline',
      }
    },
    '& img': { 
      maxWidth: '100%', 
      height: 'auto', 
      my: 2,
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[2],
    },
    '& blockquote': { 
      borderLeft: `4px solid ${theme.palette.primary.light}`, 
      pl: 2, 
      py: 1, 
      my: 2,
      fontStyle: 'italic',
      bgcolor: alpha(theme.palette.primary.main, 0.05),
      borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0` 
    }
  };

  return (
    <Box sx={{ 
      bgcolor: theme.palette.background.default,
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
              background: primaryGradient,
              boxShadow: theme.shadows[4],
              borderRadius: theme.shape.borderRadius,
              textTransform: 'none',
              fontWeight: 500,
              py: 1,
              fontFamily: theme.typography.fontFamily,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[8],
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
              background: primaryGradient,
              boxShadow: theme.shadows[4],
              borderRadius: theme.shape.borderRadius,
              textTransform: 'none',
              fontWeight: 500,
              py: 1,
              fontFamily: theme.typography.fontFamily,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[8],
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
            borderRadius: theme.shape.borderRadius * 2,
            boxShadow: theme.shadows[4],
            mb: 4,
            overflow: 'visible',
            transition: 'all 0.3s ease',
            p: { xs: 3, md: 4 },
            bgcolor: theme.palette.background.paper,
            '&:hover': {
              boxShadow: theme.shadows[8],
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            mb: 2
          }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              {blog.title}
            </Typography>
            
            {/* Action buttons - Moved from bottom to next to title */}
            {hasPermissionToEdit && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Edit">
                  <IconButton
                    onClick={handleEdit}
                    sx={{ 
                      background: primaryGradient,
                      color: theme.palette.common.white,
                      '&:hover': {
                        background: theme.palette.primary.dark,
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[6]
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete">
                  <IconButton
                    onClick={handleDelete}
                    sx={{ 
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.2),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 10px ${alpha(theme.palette.error.main, 0.3)}`
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            
            <Tooltip title="Share">
              <IconButton
                onClick={handleShare}
                sx={{ 
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.2),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 10px ${alpha(theme.palette.secondary.main, 0.2)}`
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center" 
            sx={{ 
              mb: 3,
              color: theme.palette.text.secondary,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar 
                sx={{ 
                  width: 28, 
                  height: 28, 
                  bgcolor: theme.palette.primary.main,
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
            sx={{ 
              p: 2, 
              mb: 3, 
              borderRadius: theme.shape.borderRadius,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              divider={<Divider orientation="vertical" flexItem />}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <VisibilityIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                <Typography variant="body2">{blog.number_of_views} views</Typography>
              </Stack>
              
              {blog.club_id && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PeopleIcon fontSize="small" sx={{ color: theme.palette.secondary.main }} />
                  <Typography variant="body2">Club: {blog.club_id}</Typography>
                </Stack>
              )}
              
              {blog.board_id && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DashboardIcon fontSize="small" sx={{ color: theme.palette.primary.dark }} />
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
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.dark,
                      fontSize: '0.65rem',
                      height: '22px',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
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
            borderRadius: theme.shape.borderRadius * 2,
            boxShadow: theme.shadows[4],
            '&:hover': {
              boxShadow: theme.shadows[8],
            },
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: theme.palette.background.paper,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: primaryGradient
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
                  fontFamily: theme.typography.fontFamily,
                  background: primaryGradient,
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
                  fontFamily: theme.typography.fontFamily,
                  background: primaryGradient,
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
                  fontFamily: theme.typography.fontFamily,
                  background: primaryGradient,
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
              borderRadius: theme.shape.borderRadius * 2,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8],
              },
              transition: 'all 0.3s ease',
              bgcolor: theme.palette.background.paper,
              borderLeft: `4px solid ${theme.palette.secondary.main}`
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              About the Author
            </Typography>
            <Typography 
              variant="body1"
              sx={{ 
                color: theme.palette.text.secondary,
                lineHeight: 1.6
              }}
            >
              {blog.author_info}
            </Typography>
          </Card>
        )}
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