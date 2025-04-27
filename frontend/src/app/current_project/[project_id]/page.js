"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchUserData, hasPermission } from "@/utils/auth";
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Autocomplete,
  Badge,
  useTheme,
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

export default function ProjectDetailsPage() {
  const { project_id } = useParams();
  const router = useRouter();
  const theme = useTheme();

  // State management
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [hasPermissionToEdit, setHasPermissionToEdit] = useState(false);
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

  // Get color for tags based on index
  const getTagColor = (index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.text.secondary
    ];
    return colors[index % colors.length];
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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData=await fetchUserData();
        if(userData) {
          setCurrentUser(userData);
          setIsSuperAdmin(userData.isSuperAdmin);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  },[project_id]);

  // Load all initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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

  useEffect(() => {
    if (project && currentUser) {
      const lml = async () => {
        console.log(currentUser);
        const hasPermission = await hasProjectPermission(project);
        setHasPermissionToEdit(hasPermission);
      }

      lml();
    }
  }, [project, currentUser]);

  const hasProjectPermission = (project) => {
    if (isSuperAdmin) return true;
    if (!currentUser) return false;

    const clubId = project.club_id?._id || project.club_id;
    const boardId = project.board_id?._id || project.board_id;

    return hasPermission("projects", currentUser, boardId, clubId);
  };

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
    (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  

  // Styles that adapt to theme
  const styles = {
    card: {
      mb: 4,
      borderRadius: 3,
      boxShadow: theme.shadows[4],
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: theme.shadows[8],
        transform: 'translateY(-4px)',
      },
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
      },
    },
    button: {
      borderRadius: 2,
      boxShadow: theme.shadows[2],
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: theme.shadows[4],
        transform: 'translateY(-2px)',
      },
    },
    chip: {
      height: 22,
      fontSize: '0.65rem',
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(95, 150, 230, 0.1)' 
        : 'rgba(95, 150, 230, 0.2)',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: theme.palette.mode === 'light' 
          ? 'rgba(95, 150, 230, 0.2)' 
          : 'rgba(95, 150, 230, 0.3)',
      },
    },
    timelineCard: {
      p: 2,
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(95, 150, 230, 0.05)' 
        : 'rgba(95, 150, 230, 0.1)',
      boxShadow: 'none',
      borderRadius: 2,
      '&:hover': {
        transform: 'none',
        boxShadow: 'none',
      },
      '&::before': {
        content: 'none',
      }
    },
    listItem: {
      py: 1.5,
      px: 2,
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(95, 150, 230, 0.03)' 
        : 'rgba(95, 150, 230, 0.1)',
      borderRadius: 2,
      mb: 1
    }
  };

  return (
    <Box sx={{
      p: 4,
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      {/* Back button */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/projects')}
        sx={{ mb: 3, ...styles.button }}
      >
        Back to Projects
      </Button>

      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ ml: 2, color: theme.palette.text.secondary, fontWeight: 500 }}>
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
            }}
          >
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => router.push('/projects')}
            startIcon={<ArrowBackIcon />}
            sx={styles.button}
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
            }}
          >
            Project not found
          </Alert>
          <Button
            variant="contained"
            onClick={() => router.push('/projects')}
            startIcon={<ArrowBackIcon />}
            sx={styles.button}
          >
            Back to Projects
          </Button>
        </Box>
      ) : (
        <>
          <Card sx={styles.card}>
            {project.image && (
              <CardMedia
                component="img"
                height="200"
                image={`${API_BASE_URL}/Uploads/${project.image?.filename}`}
                alt={project.title}
                sx={{
                  maxHeight: "200px", // Explicit max height
                  maxWidth: "100%", // Ensure it doesn't overflow its container
                  objectFit: 'fill',
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                }}
              />
            )}
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h4" component="h1">{project.title}</Typography>
                <Box>
                  <IconButton
                    onClick={handleShareProject}
                    sx={{ color: theme.palette.primary.main, mr: 1 }}
                  >
                    <ShareIcon />
                  </IconButton>
                  {hasPermissionToEdit && (
                    <>
                      <IconButton
                        onClick={() => setOpenEditDialog(true)}
                        sx={{ color: theme.palette.primary.main, mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={handleDeleteProject}
                        sx={{ color: theme.palette.error.main }}
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
                      project.status === 'Running' ? theme.palette.primary.light :
                      project.status === 'Completed' ? theme.palette.success.light :
                      theme.palette.error.light,
                    color: theme.palette.getContrastText(
                      project.status === 'Running' ? theme.palette.primary.light :
                      project.status === 'Completed' ? theme.palette.success.light :
                      theme.palette.error.light
                    ),
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
                    <PeopleIcon sx={{ color: theme.palette.primary.main }} />
                  </Badge>
                  <Typography variant="body2" sx={{ ml: 1, color: theme.palette.text.secondary, fontWeight: 500 }}>
                    {memberCount === 1 ? '1 Member' : `${memberCount} Members`}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>Description</Typography>
              <Typography variant="body1" sx={{ mb: 4, color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                {project.description}
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" sx={{ mb: 2 }}>Timeline</Typography>
                  <Card sx={styles.timelineCard}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        Start Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {new Date(project.start_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        End Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {new Date(project.end_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        Created On
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
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

          <Card sx={styles.card}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="h5">Project Members</Typography>
                  <Chip
                    label={memberCount}
                    size="small"
                    sx={{
                      ml: 2,
                      backgroundColor: theme.palette.mode === 'light' 
                        ? 'rgba(71, 118, 230, 0.15)' 
                        : 'rgba(71, 118, 230, 0.3)',
                      color: theme.palette.primary.main,
                      fontWeight: 'bold',
                      minWidth: '28px'
                    }}
                  />
                </Box>
                {hasPermissionToEdit && (
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setOpenAddMemberDialog(true)}
                    sx={styles.button}
                  >
                    Add Member
                  </Button>
                )}
              </Box>

              {membersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                </Box>
              ) : members.length === 0 ? (
                <Typography variant="body1" sx={{ p: 2, color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                  No members added to this project yet.
                </Typography>
              ) : (
                <List>
                  {members.map((member) => (
                    <ListItem
                      key={member._id}
                      sx={styles.listItem}
                      secondaryAction={
                        hasPermissionToEdit && (
                          <IconButton
                            edge="end"
                            aria-label="remove"
                            onClick={() => handleRemoveMember(member?.user_id?._id)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'light' 
                                  ? 'rgba(211, 47, 47, 0.1)' 
                                  : 'rgba(211, 47, 47, 0.2)'
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
                          bgcolor: theme.palette.mode === 'light' 
                            ? 'rgba(71, 118, 230, 0.1)' 
                            : 'rgba(71, 118, 230, 0.2)',
                          color: theme.palette.primary.main
                        }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600 }}>
                            {member?.user_id?.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
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
            <DialogTitle sx={{ 
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
            }}>
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
                          <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
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
                      bgcolor: theme.palette.mode === 'light' 
                        ? 'rgba(71, 118, 230, 0.1)' 
                        : 'rgba(71, 118, 230, 0.2)',
                      color: theme.palette.primary.main,
                      width: 32,
                      height: 32
                    }}>
                      <PersonIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {option.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                        {option.email_id} • {option.department}
                      </Typography>
                    </Box>
                  </Box>
                )}
                noOptionsText={
                  <Typography variant="body2" sx={{ p: 2, color: theme.palette.text.secondary }}>
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
                sx={{ mr: 2, ...styles.button }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                variant="contained"
                disabled={!selectedUser}
                sx={styles.button}
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
                boxShadow: theme.shadows[6]
              }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
}