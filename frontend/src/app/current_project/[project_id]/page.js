"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Autocomplete,
  Paper,
  Tooltip,
  Container,
  styled,
} from "@mui/material";
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  LocalOffer as TagIcon,
} from "@mui/icons-material";

const API_BASE_URL = "${process.env.NEXT_PUBLIC_BACKEND_URL}";

// Custom styled components
const GradientTypography = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4776E6 30%, #8E54E9 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 600,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 12px rgba(95, 150, 230, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 20px rgba(95, 150, 230, 0.2)',
    transform: 'translateY(-8px)',
  },
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4776E6, #8E54E9)',
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4776E6 30%, #8E54E9 90%)',
  border: 0,
  borderRadius: 8,
  boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
  color: 'white',
  padding: '10px 15px',
  textTransform: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
    transform: 'translateY(-2px)',
    background: 'linear-gradient(45deg, #3a5fc0 30%, #7d48d1 90%)',
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  borderColor: '#4776E6',
  color: '#4776E6',
  textTransform: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#3a5fc0',
    backgroundColor: 'rgba(71, 118, 230, 0.08)',
  },
}));

const StyledChip = styled(Chip)(({ color }) => ({
  borderRadius: 12,
  height: 22,
  fontSize: '0.65rem',
  fontWeight: 500,
  backgroundColor: color || 'rgba(95, 150, 230, 0.1)',
  color: color ? 'white' : '#4776E6',
  marginRight: 8,
  '&:hover': {
    backgroundColor: color ? color : 'rgba(95, 150, 230, 0.2)',
  },
}));

const StyledBadge = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(95, 150, 230, 0.1)',
  color: '#4776E6',
  padding: '4px 12px',
  borderRadius: 12,
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '0.75rem',
  fontWeight: 500,
  marginRight: 8,
  '& .MuiSvgIcon-root': {
    fontSize: '0.85rem',
    marginRight: 4,
  },
}));

const IconWithLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: 8,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4776E6 30%, #8E54E9 90%)',
  boxShadow: '0 2px 8px rgba(71, 118, 230, 0.3)',
}));

const MemberItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 8,
  marginBottom: 8,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(95, 150, 230, 0.08)',
  },
}));

const StyledIconButton = styled(IconButton)(({ color }) => ({
  color: color === 'error' ? '#d32f2f' : '#4776E6',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: color === 'error' ? 'rgba(211, 47, 47, 0.08)' : 'rgba(71, 118, 230, 0.08)',
    transform: 'scale(1.1)',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4776E6 30%, #8E54E9 90%)',
  color: 'white',
  fontWeight: 600,
}));

export default function ProjectDetailsPage() {
  const { project_id } = useParams();
  const router = useRouter();
  
  // State management
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // UI state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Running",
    tags: [],
    image: null,
  });

  // Check if user has permission to edit/delete the project
  const hasPermission = () => {
    return true; // For demo purposes, always return true
    
    if (!project || !currentUser) return false;
    
    if (isAdmin) return true;

    if (project.club_id) {
      const clubId = project.club_id._id || project.club_id;
      if (currentUser.data?.clubs?.[clubId]?.projects) return true;
    }

    if (project.board_id) {
      const boardId = project.board_id._id || project.board_id;
      if (currentUser.data?.boards?.[boardId]?.projects) return true;
    }

    return false;
  };

  // Get color for tags based on index
  const getTagColor = (index) => {
    const colors = [
      "#1976d2", "#388e3c", "#d32f2f", "#7b1fa2", 
      "#0288d1", "#f57c00", "#5d4037"
    ];
    return colors[index % colors.length];
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Running':
        return '#388e3c'; // Green
      case 'Completed':
        return '#1976d2'; // Blue
      case 'Inactive':
        return '#f57c00'; // Orange
      default:
        return '#607080'; // Default
    }
  };

  // Fetch current user data
  const fetchUserData = async () => {
    try {
      // This would be replaced with your actual auth util function
      const response = await fetch(`${API_BASE_URL}/auth/me`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const userData = await response.json();
      setCurrentUser(userData.userData);
      setIsAdmin(userData.userRole === "super_admin");
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Fetch project details
  const fetchProject = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${project_id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      
      const data = await response.json();
      setProject(data);
      setFormData({
        title: data.title,
        description: data.description,
        start_date: data.start_date ? data.start_date.substring(0, 10) : '',
        end_date: data.end_date ? data.end_date.substring(0, 10) : '',
        status: data.status,
        tags: data.tags || [],
        image: data.image || null
      });
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error.message || 'Failed to load project');
      throw error;
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setAllUsers(data.map(user => ({
        ...user,
        label: `${user.name} (${user.email_id})`
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users', 'error');
    }
  };

  // Fetch project members
  const fetchProjectMembers = async () => {
    try {
      setMembersLoading(true);
      const response = await fetch(`${API_BASE_URL}/projects/${project_id}/members`);
      if (!response.ok) throw new Error('Failed to fetch project members');
      
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching project members:', error);
      showNotification('Failed to load project members', 'error');
    } finally {
      setMembersLoading(false);
    }
  };

  // Load all initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchUserData();
        await fetchProject();
        await Promise.all([fetchAllUsers(), fetchProjectMembers()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (project_id) {
      loadData();
    }
  }, [project_id]);

  // Show notification helper
  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle project update
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    
    try {
      const formDataObj = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags') {
          value.forEach((tag, index) => {
            formDataObj.append(`tags[${index}]`, tag);
          });
        } else if (key === 'image' && value instanceof File) {
          formDataObj.append('image', value);
        } else if (value != null) {
          formDataObj.append(key, value);
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/projects/${project_id}`, {
        method: 'PUT',
        body: formDataObj
      });
      
      if (!response.ok) throw new Error('Failed to update project');
      
      const updatedProject = await response.json();
      setProject(updatedProject);
      setOpenEditDialog(false);
      showNotification('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      showNotification(error.message || 'Failed to update project', 'error');
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${project_id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete project');
      
      router.push('/projects');
      showNotification('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      showNotification(error.message || 'Failed to delete project', 'error');
    }
  };

  // Handle adding a member
  const handleAddMember = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${project_id}/members/${selectedUser._id}`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to add member');
      
      showNotification('Member added successfully');
      await fetchProjectMembers();
      setOpenAddMemberDialog(false);
      setSelectedUser(null);
      setSearchTerm("");
    } catch (error) {
      console.error('Error adding member:', error);
      showNotification(error.message || 'Failed to add member', 'error');
    }
  };

  // Handle removing a member
  const handleRemoveMember = async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${project_id}/members/${userId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to remove member');
      
      showNotification('Member removed successfully');
      await fetchProjectMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      showNotification(error.message || 'Failed to remove member', 'error');
    }
  };

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => 
    !members.some(member => member._id === user._id) && 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        background: '#f8faff'
      }}>
        <CircularProgress size={60} sx={{ color: '#4776E6', mb: 3 }} />
        <Typography 
          variant="h6" 
          sx={{ 
            background: 'linear-gradient(45deg, #4776E6 30%, #8E54E9 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 600
          }}
        >
          Loading project details...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ p: 4, background: '#f8faff', minHeight: '100vh' }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2, 
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)'
          }}
        >
          {error}
        </Alert>
        <SecondaryButton 
          variant="outlined"
          onClick={() => router.push('/projects')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Projects
        </SecondaryButton>
      </Container>
    );
  }

  // Project not found state
  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ p: 4, background: '#f8faff', minHeight: '100vh' }}>
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3, 
            borderRadius: 2, 
            boxShadow: '0 4px 12px rgba(245, 124, 0, 0.15)'
          }}
        >
          Project not found
        </Alert>
        <SecondaryButton 
          variant="outlined"
          onClick={() => router.push('/projects')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Projects
        </SecondaryButton>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 4, background: '#f8faff', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Back button */}
        <SecondaryButton
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/projects')}
          variant="outlined"
          sx={{ mb: 4 }}
        >
          Back to Projects
        </SecondaryButton>

        {/* Project details card */}
        <StyledCard sx={{ mb: 4 }}>
          {project.image && (
            <Box sx={{ position: 'relative', width: '100%', height: '350px', overflow: 'hidden' }}>
              <Image
                src={`${API_BASE_URL}/uploads/${project.image.filename}`}
                alt={project.title}
                layout="fill"
                objectFit="cover"
                style={{ 
                  borderTopLeftRadius: '16px', 
                  borderTopRightRadius: '16px'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '100px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 24,
                  right: 24,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <StyledChip 
                  label={project.status} 
                  color={getStatusColor(project.status)}
                />
                
                {hasPermission() && (
                  <Box>
                    <Tooltip title="Edit Project">
                      <StyledIconButton onClick={() => setOpenEditDialog(true)} size="small" sx={{ mr: 1, backgroundColor: 'rgba(255,255,255,0.8)' }}>
                        <EditIcon fontSize="small" />
                      </StyledIconButton>
                    </Tooltip>
                    <Tooltip title="Delete Project">
                      <StyledIconButton onClick={handleDeleteProject} color="error" size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                        <DeleteIcon fontSize="small" />
                      </StyledIconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Box>
          )}
          
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <GradientTypography variant="h4" component="h1">
                {project.title}
              </GradientTypography>
              
              {!project.image && hasPermission() && (
                <Box>
                  <Tooltip title="Edit Project">
                    <StyledIconButton onClick={() => setOpenEditDialog(true)} sx={{ mr: 1 }}>
                      <EditIcon />
                    </StyledIconButton>
                  </Tooltip>
                  <Tooltip title="Delete Project">
                    <StyledIconButton onClick={handleDeleteProject} color="error">
                      <DeleteIcon />
                    </StyledIconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {!project.image && (
              <StyledChip 
                label={project.status} 
                color={getStatusColor(project.status)}
                sx={{ mb: 3 }}
              />
            )}

            <Divider sx={{ my: 3 }} />

            {/* Description */}
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2A3B4F', mb: 2 }}>
              Description
            </Typography>
            <Typography variant="body1" sx={{ color: '#607080', mb: 4, lineHeight: 1.8 }}>
              {project.description}
            </Typography>

            {/* Timeline */}
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2A3B4F', mb: 2 }}>
              Timeline & Details
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: 'rgba(245, 247, 250, 0.7)' }}>
                  <IconWithLabel>
                    <CalendarIcon sx={{ color: '#4776E6', mr: 1.5 }} />
                    <Typography variant="body1" sx={{ color: '#2A3B4F', fontWeight: 500 }}>
                      Start Date: <span style={{ color: '#607080' }}>{new Date(project.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </Typography>
                  </IconWithLabel>
                  <IconWithLabel>
                    <CalendarIcon sx={{ color: '#8E54E9', mr: 1.5 }} />
                    <Typography variant="body1" sx={{ color: '#2A3B4F', fontWeight: 500 }}>
                      End Date: <span style={{ color: '#607080' }}>{new Date(project.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </Typography>
                  </IconWithLabel>
                  <IconWithLabel>
                    <AccessTimeIcon sx={{ color: '#4776E6', mr: 1.5 }} />
                    <Typography variant="body1" sx={{ color: '#2A3B4F', fontWeight: 500 }}>
                      Created On: <span style={{ color: '#607080' }}>{new Date(project.created_on).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </Typography>
                  </IconWithLabel>
                </Paper>
              </Grid>
            </Grid>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2A3B4F', mb: 2, display: 'flex', alignItems: 'center' }}>
                  <TagIcon sx={{ mr: 1, color: '#4776E6' }} /> Tags
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                  {project.tags.map((tag, index) => (
                    <StyledChip
                      key={index}
                      label={tag}
                      color={getTagColor(index)}
                    />
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </StyledCard>

        {/* Members card */}
        <StyledCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2A3B4F', display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, color: '#4776E6' }} /> Project Members
              </Typography>
              {hasPermission() && (
                <AnimatedButton
                  startIcon={<PersonAddIcon />}
                  onClick={() => setOpenAddMemberDialog(true)}
                >
                  Add Member
                </AnimatedButton>
              )}
            </Box>

            {membersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={30} sx={{ color: '#4776E6' }} />
              </Box>
            ) : members.length === 0 ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  borderRadius: 2,
                  backgroundColor: 'rgba(245, 247, 250, 0.7)',
                  border: '1px dashed #4776E6',
                }}
              >
                <Typography variant="body1" sx={{ color: '#607080' }}>
                  No members added to this project yet.
                </Typography>
              </Paper>
            ) : (
              <List sx={{ p: 0 }}>
                {members.map((member) => (
                  <MemberItem
                    key={member._id}
                    secondaryAction={
                      hasPermission() && (
                        <Tooltip title="Remove Member">
                          <StyledIconButton
                            edge="end"
                            aria-label="remove"
                            onClick={() => handleRemoveMember(member._id)}
                            color="error"
                            size="small"
                          >
                            <CloseIcon />
                          </StyledIconButton>
                        </Tooltip>
                      )
                    }
                    sx={{
                      backgroundColor: 'white',
                      mb: 2,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(95, 150, 230, 0.08)',
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    <ListItemAvatar>
                      <StyledAvatar>{member.name.charAt(0).toUpperCase()}</StyledAvatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 500, color: '#2A3B4F' }}>
                          {member.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#607080' }}>
                            {member.email_id}
                          </Typography>
                          <StyledBadge sx={{ mt: 1 }}>
                            {member.department}
                          </StyledBadge>
                        </Box>
                      }
                    />
                  </MemberItem>
                ))}
              </List>
            )}
          </CardContent>
        </StyledCard>

        {/* Edit Project Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 12px 24px rgba(95, 150, 230, 0.2)',
            }
          }}
        >
          <StyledDialogTitle>
            Edit Project
            <IconButton
              onClick={() => setOpenEditDialog(false)}
              sx={{ position: "absolute", right: 8, top: 8, color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </StyledDialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleUpdateProject} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                margin="normal"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4776E6',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4776E6',
                      boxShadow: '0 0 0 3px rgba(71, 118, 230, 0.1)',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#4776E6',
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                margin="normal"
                multiline
                rows={4}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4776E6',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4776E6',
                      boxShadow: '0 0 0 3px rgba(71, 118, 230, 0.1)',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#4776E6',
                  }
                }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleFormChange}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4776E6',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4776E6',
                          boxShadow: '0 0 0 3px rgba(71, 118, 230, 0.1)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#4776E6',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleFormChange}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4776E6',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4776E6',
                          boxShadow: '0 0 0 3px rgba(71, 118, 230, 0.1)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#4776E6',
                      }
                    }}
                  />
                </Grid>
              </Grid>
              
              <TextField
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                margin="normal"
                select
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4776E6',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4776E6',
                      boxShadow: '0 0 0 3px rgba(71, 118, 230, 0.1)',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#4776E6',
                  }
                }}
              >
                <MenuItem value="Running">Running</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <SecondaryButton onClick={() => setOpenEditDialog(false)}>
              Cancel
            </SecondaryButton>
            <AnimatedButton onClick={handleUpdateProject}>
              Save Changes
            </AnimatedButton>
          </DialogActions>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog
          open={openAddMemberDialog}
          onClose={() => {
            setOpenAddMemberDialog(false);
            setSelectedUser(null);
            setSearchTerm("");
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 12px 24px rgba(95, 150, 230, 0.2)',
            }
          }}
        >
          <StyledDialogTitle>
            Add Member to Project
            <IconButton
              onClick={() => {
                setOpenAddMemberDialog(false);
                setSelectedUser(null);
                setSearchTerm("");
              }}
              sx={{ position: "absolute", right: 8, top: 8, color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </StyledDialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Box sx={{ mt: 2 }}>
              <Autocomplete
                options={filteredUsers}
                getOptionLabel={(option) => `${option.name} (${option.email_id})`}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                onChange={(event, newValue) => {
                  setSelectedUser(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                  setSearchTerm(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search users"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <SearchIcon sx={{ mr: 1, color: '#4776E6' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4776E6',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4776E6',
                          boxShadow: '0 0 0 3px rgba(71, 118, 230, 0.1)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#4776E6',
                      }
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box 
                    component="li" 
                    {...props} 
                    key={option._id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(71, 118, 230, 0.08)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Avatar sx={{ mr: 2, background: 'linear-gradient(45deg, #4776E6 30%, #8E54E9 90%)' }}>
                        {option.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography>{option.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.email_id} • {option.department}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                sx={{
                  '& .MuiAutocomplete-popupIndicator': {
                    color: '#4776E6',
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <SecondaryButton 
              onClick={() => {
                setOpenAddMemberDialog(false);
                setSelectedUser(null);
                setSearchTerm("");
              }}
            >
              Cancel
            </SecondaryButton>
            <AnimatedButton
              onClick={handleAddMember}
              disabled={!selectedUser}
            >
              Add Member
            </AnimatedButton>
          </DialogActions>
        </Dialog>

        {/* Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={() => setNotification(prev => ({ ...prev, open: false }))}
            severity={notification.severity}
            variant="filled"
            sx={{ 
              width: "100%",
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '&.MuiAlert-filledSuccess': {
                background: 'linear-gradient(45deg, #4776E6 30%, #8E54E9 90%)',
              },
              '&.MuiAlert-filledError': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
              }
            }}
            iconMapping={{
              success: <CheckCircleIcon fontSize="inherit" />,
              error: <CloseIcon fontSize="inherit" />,
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
