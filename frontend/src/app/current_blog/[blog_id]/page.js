"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchUserData } from "@/utils/auth";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Divider,
  Chip,
  IconButton,
  Fab,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.blog_id;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    title: "",
    introduction: "",
    mainContent: "",
    conclusion: "",
    author: "",
    tags: [],
    image: null,
  });

  // Check if user has permission to edit/delete this blog
  const hasBlogPermission = () => {
    if (!blog || !currentUser) return false;
    
    if (isAdmin) return true;

    if (blog.club_id) {
      const clubId = blog.club_id._id || blog.club_id;
      if (currentUser.data?.clubs?.[clubId]?.blogs) {
        return true;
      }
    }

    if (blog.board_id) {
      const boardId = blog.board_id._id || blog.board_id;
      if (currentUser.data?.boards?.[boardId]?.blogs) {
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userData = await fetchUserData();
        if (userData) {
          setCurrentUser(userData.userData);
          setUserId(userData.userId);
          setIsAdmin(userData.userRole === "super_admin");
        }

        // Fetch blog details
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/blogs/blogs/${blogId}`);
        if (!response.ok) throw new Error('Failed to fetch blog');
        
        const result = await response.json();
        if (!result) throw new Error('Blog not found');
        
        setBlog({
          ...result,
          id: result._id,
          mainContent: result.main_content || "",
          createdAt: new Date(result.published_at || result.createdAt).toLocaleDateString(),
          author: result.author_info || "Unknown Author",
          image: result.image || null
        });
        
        setFormData({
          title: result.title,
          introduction: result.introduction,
          mainContent: result.main_content || "",
          conclusion: result.conclusion,
          author: result.author_info || "",
          tags: result.tags || [],
          image: result.image || null
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
        setNotification({
          open: true,
          message: "Failed to load blog",
          severity: "error"
        });
      }
    };

    if (blogId) {
      fetchData();
    }
  }, [blogId]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/blogs/blogs/${blogId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete blog');
      
      router.push('/blogs');
      setNotification({
        open: true,
        message: "Blog deleted successfully",
        severity: "success"
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      setNotification({
        open: true,
        message: error.message || "Failed to delete blog",
        severity: "error"
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const multipartFormData = new FormData();
      
      multipartFormData.append("title", formData.title);
      multipartFormData.append("introduction", formData.introduction);
      multipartFormData.append("main_content", formData.mainContent);
      multipartFormData.append("conclusion", formData.conclusion);
      multipartFormData.append("author_info", formData.author);
      
      formData.tags.forEach((tag, index) => {
        multipartFormData.append(`tags[${index}]`, tag);
      });
      
      if (formData.image instanceof File) {
        multipartFormData.append("image", formData.image);
      } else if (formData.image && typeof formData.image === "string") {
        multipartFormData.append("image", formData.image);
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/blogs/blogs/${blogId}`, {
        method: 'PUT',
        body: multipartFormData
      });
      
      if (!response.ok) throw new Error('Failed to update blog');
      
      const updatedBlog = await response.json();
      
      setBlog({
        ...updatedBlog,
        id: updatedBlog._id,
        mainContent: updatedBlog.main_content || "",
        createdAt: new Date(updatedBlog.published_at || updatedBlog.createdAt).toLocaleDateString(),
        author: updatedBlog.author_info || "Unknown Author",
        image: updatedBlog.image || null
      });
      
      setOpenDialog(false);
      setIsEditing(false);
      setNotification({
        open: true,
        message: "Blog updated successfully",
        severity: "success"
      });
    } catch (error) {
      console.error('Error updating blog:', error);
      setNotification({
        open: true,
        message: error.message || "Failed to update blog",
        severity: "error"
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ py: 4, textAlign: "center", backgroundColor: "#f8faff", padding: "0", height: '100vh', width: '100vw', overflow: 'auto' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading blog...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{ py: 4, textAlign: "center", backgroundColor: "#f8faff", padding: "0", height: '100vh', width: '100vw', overflow: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/blogs')}
          sx={{ mb: 3, background: 'linear-gradient(45deg, #4776E6, #8E54E9)', color: 'white', boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)', '&:hover': { background: 'linear-gradient(45deg, #3a5fc0, #7b1fa2)', boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)' } }}
        >
          Back to Blogs
        </Button>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container maxWidth={false} sx={{ py: 4, textAlign: "center", backgroundColor: "#f8faff", padding: "0", height: '100vh', width: '100vw', overflow: 'auto' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Blog not found
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/blogs')}
          sx={{ mb: 3, background: 'linear-gradient(45deg, #4776E6, #8E54E9)', color: 'white', boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)', '&:hover': { background: 'linear-gradient(45deg, #3a5fc0, #7b1fa2)', boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)' } }}
        >
          Back to Blogs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, textAlign: "center", backgroundColor: "#f8faff", padding: "0", height: '100vh', width: '100vw', overflow: 'auto' }}>
      <Box sx={{ position: 'relative', height: '60px', backgroundColor: '#F8F8F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            }
          }}
          sx={{
            background: 'linear-gradient(45deg, #4776E6, #8E54E9)',
            color: 'white',
            boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
            opacity: window.history.length > 1 ? 1 : 0.5,
            pointerEvents: window.history.length > 1 ? 'auto' : 'none',
            '&:hover': {
              background: window.history.length > 1 ? 'linear-gradient(45deg, #3a5fc0, #7b1fa2)' : 'linear-gradient(45deg, #4776E6, #8E54E9)',
              boxShadow: window.history.length > 1 ? '0 6px 15px rgba(71, 118, 230, 0.4)' : '0 4px 10px rgba(71, 118, 230, 0.3)'
            }
          }}
        >
          Back
        </Button>
        <Button
          onClick={() => router.push('/blogs')}
          sx={{
            background: 'linear-gradient(45deg, #4776E6, #8E54E9)',
            color: 'white',
            boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #3a5fc0, #7b1fa2)',
              boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)'
            }
          }}
        >
          All Blogs
        </Button>
      </Box>

      {blog.image && (
        <Box
          component="img"
          sx={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
            display: "block",
            backgroundColor: '#E0E0E0'
          }}
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${blog.image.filename}`}
          alt={blog.title}
        />
      )}

      <Box
        component="img"
        sx={{
          width: "100vw",
          height: "300px",
          objectFit: "cover",
          display: "block",
          backgroundColor: '#E0E0E0'
        }}
        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/Mount Fuji, Japan - 1.jpg`}
        alt="Mount Fuji, Japan"
      />

      <Box sx={{ width: '50%', mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif', color: '#2C2C2C', mt: 4 }}>
          {blog.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'center' }}>
          <Avatar sx={{ width: 50, height: 50, backgroundColor: '#D0D0D0' }}>
            <PersonIcon />
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1" sx={{ fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif', fontWeight: 'bold', color: '#2C2C2C' }}>
              {blog.author}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif', color: '#777777' }}>
              Author Title
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif', color: '#777777', ml: 'auto' }}>
            {blog.createdAt} · 8 min read
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
          {blog.tags.map((tag, index) => (
            <Chip key={index} label={tag} sx={{ backgroundColor: '#F0F0F0', color: '#555555', borderRadius: '15px' }} />
          ))}
        </Box>

        <Divider sx={{ my: 3, mx: 10, borderColor: '#EEEEEE' }} />

        <Typography variant="body1" sx={{ mx: 10, color: '#555555', opacity: 0.8, fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif' }}
          dangerouslySetInnerHTML={{ __html: blog.introduction }}
        />

        <Typography variant="h5" sx={{ mx: 10, mt: 4, fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif', fontWeight: 'bold', color: '#2C2C2C' }}>
          Section Heading
        </Typography>

        <Typography variant="body1" sx={{ mx: 10, color: '#555555', opacity: 0.8, fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif' }}
          dangerouslySetInnerHTML={{ __html: blog.mainContent }}
        />

        <Divider sx={{ my: 3, mx: 10, borderColor: '#DDDDDD' }} />

        <Typography variant="h6" sx={{ mx: 10, fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif', fontStyle: 'italic', color: '#555555', textAlign: 'center' }}>
          "Premium pull quote highlighting key insights"
        </Typography>

        <Divider sx={{ my: 3, mx: 10, borderColor: '#DDDDDD' }} />

        <Box sx={{ mx: 10, my: 4, backgroundColor: '#F8F8F8', borderRadius: '4px', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar sx={{ backgroundColor: '#EEEEEE' }} />
            <Avatar sx={{ backgroundColor: '#EEEEEE' }} />
            <Avatar sx={{ backgroundColor: '#EEEEEE' }} />
          </Box>
          <Typography variant="body2" sx={{ fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif', color: '#777777' }}>
            128 Likes · 24 Comments
          </Typography>
        </Box>
      </Box>

      {/* Edit Blog Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
        sx={{ borderRadius: '8px' }}
      >
        <DialogTitle>
          Edit Blog
          <IconButton
            onClick={() => setOpenDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              margin="normal"
              required
              sx={{ boxShadow: '0 2px 8px rgba(95, 150, 230, 0.1)', '&:focus': { boxShadow: '0 4px 15px rgba(95, 150, 230, 0.2)', outline: '2px solid #4776E6' } }}
            />
            
            <TextField
              fullWidth
              label="Author"
              name="author"
              value={formData.author}
              onChange={handleFormChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Introduction"
              name="introduction"
              value={formData.introduction}
              onChange={handleFormChange}
              margin="normal"
              multiline
              rows={4}
            />
            
            <TextField
              fullWidth
              label="Main Content"
              name="mainContent"
              value={formData.mainContent}
              onChange={handleFormChange}
              margin="normal"
              multiline
              rows={8}
              required
            />
            
            <TextField
              fullWidth
              label="Conclusion"
              name="conclusion"
              value={formData.conclusion}
              onChange={handleFormChange}
              margin="normal"
              multiline
              rows={4}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                onClick={() => setOpenDialog(false)}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
