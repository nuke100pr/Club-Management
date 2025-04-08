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
        const response = await fetch(`http://localhost:5000/blogs/blogs/${blogId}`);
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
      const response = await fetch(`http://localhost:5000/blogs/blogs/${blogId}`, {
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
      
      const response = await fetch(`http://localhost:5000/blogs/blogs/${blogId}`, {
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
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading blog...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/blogs')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Blogs
        </Button>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Blog not found
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/blogs')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Blogs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/blogs')}
        sx={{ mb: 3 }}
      >
        Back to All Blogs
      </Button>

      <Card sx={{ mb: 4 }}>
        {blog.image && (
          <Box
            component="img"
            sx={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              display: "block"
            }}
            src={`http://localhost:5000/uploads/${blog.image.filename}`}
            alt={blog.title}
          />
        )}
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h3" component="h1">
              {blog.title}
            </Typography>
            
            {hasBlogPermission() && (
              <Box>
                <IconButton onClick={handleEdit} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={handleDelete} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Avatar>
              <PersonIcon />
            </Avatar>
            <Typography variant="subtitle1" color="text.secondary">
              {blog.author}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 2 }}>
              Published: {blog.createdAt}
            </Typography>
          </Box>

          {blog.tags && blog.tags.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {blog.tags.map((tag, index) => (
                <Chip key={index} label={tag} color="primary" variant="outlined" />
              ))}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom>
            Introduction
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            {blog.introduction}
          </Typography>

          <Typography variant="h5" gutterBottom>
            Main Content
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            {blog.mainContent}
          </Typography>

          <Typography variant="h5" gutterBottom>
            Conclusion
          </Typography>
          <Typography variant="body1" paragraph>
            {blog.conclusion}
          </Typography>
        </CardContent>
      </Card>

      {/* Edit Blog Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
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