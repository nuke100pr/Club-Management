"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
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
  createTheme,
  ThemeProvider,
  Badge,
} from "@mui/material";
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

import CreateProjectDialog from "@/components/projects/CreateProjectDialog";

const API_BASE_URL = "http://localhost:5000";

// Custom theme based on the global design system
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2A3B4F',
    },
    h5: {
      fontWeight: 600,
      background: 'linear-gradient(to right, #4776E6, #8E54E9)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h6: {
      fontWeight: 600,
      color: '#2A3B4F',
    },
    body1: {
      color: '#607080',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  palette: {
    primary: {
      main: '#4776E6',
      light: '#6a98ff',
      dark: '#3a5fc0',
    },
    secondary: {
      main: '#8E54E9',
    },
    background: {
      default: '#f8faff',
      paper: '#ffffff',
    },
    text: {
      primary: '#2A3B4F',
      secondary: '#607080',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(95, 150, 230, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 20px rgba(95, 150, 230, 0.2)',
            transform: 'translateY(-8px)',
          },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to right, #4776E6, #8E54E9)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(to right, #4776E6, #8E54E9)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(to right, #3a5fc0, #7b46c7)',
          },
        },
        outlined: {
          borderColor: '#4776E6',
          color: '#4776E6',
          '&:hover': {
            backgroundColor: 'rgba(71, 118, 230, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            boxShadow: '0 2px 8px rgba(95, 150, 230, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover, &.Mui-focused': {
              boxShadow: '0 4px 15px rgba(95, 150, 230, 0.2)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4776E6',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 22,
          fontSize: '0.65rem',
          backgroundColor: 'rgba(95, 150, 230, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(95, 150, 230, 0.2)',
          },
        },
        label: {
          fontWeight: 500,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '24px 0',
          backgroundColor: 'rgba(95, 150, 230, 0.1)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            backgroundColor: 'rgba(71, 118, 230, 0.1)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 12px 24px rgba(71, 118, 230, 0.2)',
          overflow: 'hidden',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(to right, #4776E6, #8E54E9)',
          color: 'white',
          padding: '16px 24px',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: '8px 0',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          borderRadius: 8,
          margin: '4px 0',
          '&:hover': {
            backgroundColor: 'rgba(71, 118, 230, 0.05)',
          },
        },
      },
    },
  },
});

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

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
    return true;
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

  // Fetch current user data
  const fetchUserData = async () => {
    try {
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
        start_date: data.start_date,
        end_date: data.end_date,
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
      console.log(data);
      setMemberCount(data.length);
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
      const formData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags') {
          value.forEach((tag, index) => {
            formData.append(`tags[${index}]`, tag);
          });
        } else if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (value != null) {
          formData.append(key, value);
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/projects/${project_id}`, {
        method: 'PUT',
        body: formData
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
    if (!confirm('Are you sure you want to remove this member from the project?')) return;
    
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

  // Handle sharing project
  const handleShareProject = async () => {
    if (!project) return;

    const shareData = {
      title: project.title,
      text: project.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showNotification('Project shared successfully');
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(shareData.url);
        showNotification('Project URL copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing project:', error);
      showNotification('Failed to share project', 'error');
    }
  };

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => 
    !members.some(member => member.user_id._id === user._id) && 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email_id.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        p: 4, 
        backgroundColor: '#f8faff', 
        minHeight: '100vh'
      }}>
        {/* Back button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/projects')}
          sx={{ mb: 3 }}
        >
          Back to Projects
        </Button>

        {/* Loading state */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress sx={{ color: '#4776E6' }} />
            <Typography variant="h6" sx={{ ml: 2, color: '#607080', fontWeight: 500 }}>
              Loading project...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: '#d32f2f'
                }
              }}
            >
              {error}
            </Alert>
            <Button 
              variant="contained" 
              onClick={() => router.push('/projects')}
              startIcon={<ArrowBackIcon />}
            >
              Back to Projects
            </Button>
          </Box>
        ) : !project ? (
          <Box sx={{ p: 3 }}>
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: '#f57c00'
                }
              }}
            >
              Project not found
            </Alert>
            <Button 
              variant="contained" 
              onClick={() => router.push('/projects')}
              startIcon={<ArrowBackIcon />}
            >
              Back to Projects
            </Button>
          </Box>
        ) : (
          <>
            <Card sx={{ mb: 4 }}>
              {project.image && (
                <CardMedia
                  component="img"
                  height="300"
                  image={`${API_BASE_URL}/Uploads/${project.image.filename}`}
                  alt={project.title}
                  sx={{
                    objectFit: 'cover',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                />
              )}
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h4" component="h1">{project.title}</Typography>
                  <Box>
                    <IconButton 
                      onClick={handleShareProject}
                      sx={{ color: '#4776E6', mr: 1 }}
                    >
                      <ShareIcon />
                    </IconButton>
                    {hasPermission() && (
                      <>
                        <IconButton 
                          onClick={() => setOpenEditDialog(true)} 
                          sx={{ color: '#4776E6', mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={handleDeleteProject} 
                          sx={{ color: '#d32f2f' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Chip
                    label={project.status}
                    size="small"
                    sx={{
                      backgroundColor: 
                        project.status === 'Running' ? 'rgba(25, 118, 210, 0.1)' :
                        project.status === 'Completed' ? 'rgba(46, 125, 50, 0.1)' :
                        'rgba(211, 47, 47, 0.1)',
                      color: 
                        project.status === 'Running' ? '#1976d2' :
                        project.status === 'Completed' ? '#2e7d32' :
                        '#d32f2f',
                      fontWeight: 600,
                      borderRadius: '12px',
                      '& .MuiChip-label': {
                        px: 2
                      }
                    }}
                  />
                  
                  <Box sx={{ display: "flex", alignItems: "center", ml: 3 }}>
                    <Badge
                      badgeContent={memberCount}
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                        }
                      }}
                    >
                      <PeopleIcon sx={{ color: '#4776E6' }} />
                    </Badge>
                    <Typography variant="body2" sx={{ ml: 1, color: '#607080', fontWeight: 500 }}>
                      {memberCount === 1 ? '1 Member' : `${memberCount} Members`}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>Description</Typography>
                <Typography variant="body1" sx={{ mb: 4, color: '#607080', lineHeight: 1.7 }}>
                  {project.description}
                </Typography>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h5" sx={{ mb: 2 }}>Timeline</Typography>
                    <Card sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(95, 150, 230, 0.05)',
                      boxShadow: 'none',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'none',
                        boxShadow: 'none',
                      },
                      '&::before': {
                        content: 'none',
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#607080', fontWeight: 500 }}>
                          Start Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#2A3B4F' }}>
                          {new Date(project.start_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#607080', fontWeight: 500 }}>
                          End Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#2A3B4F' }}>
                          {new Date(project.end_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#607080', fontWeight: 500 }}>
                          Created On
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#2A3B4F' }}>
                          {new Date(project.created_on).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>

                {project.tags && project.tags.length > 0 && (
                  <>
                    <Typography variant="h5" sx={{ mb: 2 }}>Tags</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                      {project.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            backgroundColor: `${getTagColor(index)}20`,
                            color: getTagColor(index),
                            fontWeight: 500,
                            borderRadius: '12px',
                            px: 1,
                            '& .MuiChip-label': {
                              px: 1.5
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h5">Project Members</Typography>
                    <Chip 
                      label={memberCount} 
                      size="small"
                      sx={{ 
                        ml: 2, 
                        backgroundColor: 'rgba(71, 118, 230, 0.15)',
                        color: '#4776E6',
                        fontWeight: 'bold',
                        minWidth: '28px'
                      }}
                    />
                  </Box>
                  {hasPermission() && (
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={() => setOpenAddMemberDialog(true)}
                    >
                      Add Member
                    </Button>
                  )}
                </Box>

                {membersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={28} sx={{ color: '#4776E6' }} />
                  </Box>
                ) : members.length === 0 ? (
                  <Typography variant="body1" sx={{ p: 2, color: '#607080', fontStyle: 'italic' }}>
                    No members added to this project yet.
                  </Typography>
                ) : (
                  <List>
                    {members.map((member) => (
                      <ListItem
                        key={member._id}
                        sx={{ 
                          py: 1.5,
                          px: 2,
                          backgroundColor: 'rgba(95, 150, 230, 0.03)',
                          borderRadius: 2,
                          mb: 1
                        }}
                        secondaryAction={
                          hasPermission() && (
                            <IconButton
                              edge="end"
                              aria-label="remove"
                              onClick={() => handleRemoveMember(member?.user_id?._id)}
                              sx={{ 
                                color: '#d32f2f',
                                '&:hover': { 
                                  backgroundColor: 'rgba(211, 47, 47, 0.1)'
                                }
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: 'rgba(71, 118, 230, 0.1)', 
                            color: '#4776E6'
                          }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: 600, color: '#2A3B4F' }}>
                              {member?.user_id?.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: '#607080' }}>
                              {`${member?.user_id?.email_id} • ${member?.user_id?.department}`}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            <CreateProjectDialog
              open={openEditDialog}
              onClose={() => setOpenEditDialog(false)}
              onSubmit={() => {
                setOpenEditDialog(false);
                fetchProject();
              }}
              projectToEdit={project}
              fetchProjectDetails={async () => project}
              createProject={null}
              updateProject={async (projectId, formData) => {
                try {
                  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                    method: 'PUT',
                    body: formData
                  });
                  
                  if (!response.ok) throw new Error('Failed to update project');
                  
                  const updatedProject = await response.json();
                  setProject(updatedProject);
                  showNotification('Project updated successfully');
                  return updatedProject;
                } catch (error) {
                  console.error('Error updating project:', error);
                  showNotification(error.message || 'Failed to update project', 'error');
                  return null;
                }
              }}
            />

            <Dialog
              open={openAddMemberDialog}
              onClose={() => {
                setOpenAddMemberDialog(false);
                setSelectedUser(null);
                setSearchTerm("");
              }}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>
                Add Member to Project
                <IconButton
                  onClick={() => {
                    setOpenAddMemberDialog(false);
                    setSelectedUser(null);
                    setSearchTerm("");
                  }}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'white'
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ pt: 3 }}>
                <Autocomplete
                  options={filteredUsers}
                  getOptionLabel={(option) => option.label}
                  value={selectedUser}
                  onChange={(event, newValue) => setSelectedUser(newValue)}
                  inputValue={searchTerm}
                  onInputChange={(event, newInputValue) => setSearchTerm(newInputValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search users"
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <SearchIcon sx={{ color: '#607080', mr: 1 }} />
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ py: 1.5 }}>
                      <Avatar sx={{ 
                        mr: 2, 
                        bgcolor: 'rgba(71, 118, 230, 0.1)', 
                        color: '#4776E6',
                        width: 32,
                        height: 32
                      }}>
                        <PersonIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {option.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#607080', fontSize: '0.8rem' }}>
                          {option.email_id} • {option.department}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText={
                    <Typography variant="body2" sx={{ p: 2, color: '#607080' }}>
                      No users found. Try a different search term.
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button
                  onClick={() => {
                    setOpenAddMemberDialog(false);
                    setSelectedUser(null);
                    setSearchTerm("");
                  }}
                  variant="outlined"
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMember}
                  variant="contained"
                  disabled={!selectedUser}
                >
                  Add Member
                </Button>
              </DialogActions>
            </Dialog>

            <Snackbar
              open={notification.open}
              autoHideDuration={6000}
              onClose={() => setNotification(prev => ({ ...prev, open: false }))}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                severity={notification.severity}
                sx={{ 
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                {notification.message}
              </Alert>
            </Snackbar>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}