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
} from "@mui/material";
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

const API_BASE_URL = "http://localhost:5000";

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
      "#4CAF50", "#FF5722", "#9C27B0", "#2196F3", 
      "#3f51b5", "#00bcd4", "#f44336"
    ];
    return colors[index % colors.length];
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
      
      // Append all form fields
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading project...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/projects')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  // Project not found state
  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>Project not found</Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/projects')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/projects')}
        sx={{ mb: 3 }}
      >
        Back to Projects
      </Button>

      {/* Project details card */}
      <Card sx={{ mb: 4 }}>
        {project.image && (
          <CardMedia
            component="img"
            height="300"
            image={`${API_BASE_URL}/uploads/${project.image.filename}`}
            alt={project.title}
          />
        )}
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h4" component="h1">{project.title}</Typography>
            
            {hasPermission() && (
              <Box>
                <IconButton onClick={() => setOpenEditDialog(true)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={handleDeleteProject} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Status chip */}
          <Chip
            label={project.status}
            size="small"
            sx={{
              backgroundColor: getTagColor(0),
              color: "white",
              mb: 3,
            }}
          />

          <Divider sx={{ my: 3 }} />

          {/* Description */}
          <Typography variant="h5" gutterBottom>Description</Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            {project.description}
          </Typography>

          {/* Timeline */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Timeline</Typography>
              <Typography variant="body1" paragraph>
                <strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>End Date:</strong> {new Date(project.end_date).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Created On:</strong> {new Date(project.created_on).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom>Tags</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {project.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    sx={{
                      backgroundColor: getTagColor(index + 1),
                      color: "white",
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Members card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" component="h2">Project Members</Typography>
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
              <CircularProgress size={24} />
            </Box>
          ) : members.length === 0 ? (
            <Typography variant="body1" sx={{ p: 2 }}>
              No members added to this project yet.
            </Typography>
          ) : (
            <List>
              {members.map((member) => (
                <ListItem
                  key={member._id}
                  secondaryAction={
                    hasPermission() && (
                      <IconButton
                        edge="end"
                        aria-label="remove"
                        onClick={() => handleRemoveMember(member._id)}
                      >
                        <CloseIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar><PersonIcon /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={`${member.email_id} • ${member.department}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Edit Project
          <IconButton
            onClick={() => setOpenEditDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleUpdateProject} sx={{ mt: 2 }}>
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
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            
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
            />
            
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
            />
            
            <TextField
              fullWidth
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              margin="normal"
              select
              required
            >
              <MenuItem value="Running">Running</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateProject} variant="contained" color="primary">
            Save Changes
          </Button>
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
      >
        <DialogTitle>
          Add Member to Project
          <IconButton
            onClick={() => {
              setOpenAddMemberDialog(false);
              setSelectedUser(null);
              setSearchTerm("");
            }}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
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
                    startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}><PersonIcon /></Avatar>
                    <Box>
                      <Typography>{option.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.email_id} • {option.department}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenAddMemberDialog(false);
              setSelectedUser(null);
              setSearchTerm("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddMember}
            disabled={!selectedUser}
          >
            Add Member
          </Button>
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
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}