import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    Stack,
    Skeleton,
    useTheme,
    IconButton,
    Fab,
    Divider,
  } from "@mui/material";
  import { useState, useEffect } from "react";
  import { useRouter } from "next/navigation";
  import EditIcon from "@mui/icons-material/Edit";
  import DeleteIcon from "@mui/icons-material/Delete";
  import AddIcon from "@mui/icons-material/Add";
  import CreateProjectDialog from "../../components/projects/CreateProjectDialog";
  import { fetchUserData } from "@/utils/auth";
  
  // Add fade-in animation styles
  const fadeInAnimation = {
    "@keyframes fadeIn": {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    animation: "fadeIn 0.5s ease-in",
  };
  
  // Function to generate colors for tags
  const getTagColor = (index) => {
    const colors = [
      "#4CAF50", // Green
      "#FF5722", // Orange
      "#9C27B0", // Purple
      "#2196F3", // Blue
      "#3f51b5", // Indigo
      "#00bcd4", // Cyan
      "#f44336", // Red
    ];
    return colors[index % colors.length];
  };
  
  export default function ProjectCardPage({clubId}) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [addProjectOpen, setAddProjectOpen] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [userClubsWithProjectPermission, setUserClubsWithProjectPermission] = useState([]);
    const [userBoardsWithProjectPermission, setUserBoardsWithProjectPermission] = useState([]);
  
    // Fetch user data on mount
    useEffect(() => {
      async function loadUserData() {
        const result = await fetchUserData();
  
        if (result) {
          setUserData(result.userData);
          setUserId(result.userId);
          setIsSuperAdmin(result.isSuperAdmin);
  
          // Extract clubs with projects permission
          if (result.userData?.data?.clubs) {
            const clubsWithPermission = Object.keys(result.userData.data.clubs)
              .filter(clubId => result.userData.data.clubs[clubId].projects === true);
            setUserClubsWithProjectPermission(clubsWithPermission);
          }
  
          // Extract boards with projects permission
          if (result.userData?.data?.boards) {
            const boardsWithPermission = Object.keys(result.userData.data.boards)
              .filter(clubId => result.userData.data.boards[clubId].projects === true);
            setUserBoardsWithProjectPermission(boardsWithPermission);
          }
        }
      }
      loadUserData();
    }, []);
  
    // Check if user has permission to edit/delete a project
    const hasProjectPermission = (project) => {
      // Superadmins have all permissions
      if (isSuperAdmin) return true;
  
      // Check if project belongs to a club where user has permission
      if (project.club_id) {
        const clubId = project.club_id._id || project.club_id;
        if (userClubsWithProjectPermission.includes(clubId)) {
          return true;
        }
      }
  
      // Check if project belongs to a board where user has permission
      if (project.board_id) {
        const clubId = project.board_id._id || project.board_id;
        if (userBoardsWithProjectPermission.includes(clubId)) {
          return true;
        }
      }
  
      return false;
    };
  
    // Check if user can create projects
    const canCreateProjects = () => {
      return isSuperAdmin || 
             userClubsWithProjectPermission.length > 0 || 
             userBoardsWithProjectPermission.length > 0;
    };
  
    // Fetch projects from backend with improved loading behavior
    useEffect(() => {
      const fetchProjects = async () => {
        try {
          setLoading(true);
          const fetchStart = Date.now();
          const minLoadingTime = 500; // Minimum loading time in ms
    
          // Create URL with search parameters
          const url = new URL("http://localhost:5000/projects/api/");
          
          // Add clubId if available
          if (clubId) {
            url.searchParams.append('board_id', clubId);
          }
          
          // Add userId if available
          if (userId) {
            url.searchParams.append('userId', userId);
          }
    
          const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
    
          if (!response.ok) {
            throw new Error("Failed to fetch projects");
          }
    
          const data = await response.json();
          
          const loadingElapsed = Date.now() - fetchStart;
          
          if (loadingElapsed < minLoadingTime) {
            setTimeout(() => {
              setProjects(data);
              setLoading(false);
            }, minLoadingTime - loadingElapsed);
          } else {
            setProjects(data);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching projects:", error);
          setTimeout(() => setLoading(false), 500);
        }
      };
    
      fetchProjects();
    }, []); // Add dependencies here
  
    const fetchProjectDetails = async (projectId) => {
      try {
        const response = await fetch(
          `http://localhost:5000/projects/${projectId}`
        );
  
        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }
  
        return await response.json();
      } catch (error) {
        console.error("Error fetching project details:", error);
        return null;
      }
    };
  
    const createProject = async (formData) => {
      try {
        const response = await fetch("http://localhost:5000/projects/", {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }
  
        const result = await response.json();
        fetchProjectsWithLoading();
        return result;
      } catch (error) {
        console.error("Error creating project:", error);
        alert("Failed to create project: " + error.message);
        return null;
      }
    };
  
    // Added a separate function for fetchProjects with loading
    const fetchProjectsWithLoading = async () => {
      setLoading(true);
      const minLoadingTime = 500; // Shorter loading for refresh operations
      const fetchStart = Date.now();
      
      try {
        // Create URL with search parameters
        const url = new URL("http://localhost:5000/projects/api/");
        
        // Add clubId if available
        if (clubId) {
          url.searchParams.append('board_id', clubId);
        }
        
        // Add userId if available
        if (userId) {
          url.searchParams.append('userId', userId);
        }
    
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
    
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
    
        const data = await response.json();
        
        const loadingElapsed = Date.now() - fetchStart;
        if (loadingElapsed < minLoadingTime) {
          setTimeout(() => {
            setProjects(data);
            setLoading(false);
          }, minLoadingTime - loadingElapsed);
        } else {
          setProjects(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setTimeout(() => setLoading(false), 500);
      }
    };
  
    const updateProject = async (projectId, formData) => {
      try {
        const response = await fetch(
          `http://localhost:5000/projects/${projectId}`,
          {
            method: "PUT",
            body: formData,
          }
        );
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }
  
        const result = await response.json();
        fetchProjectsWithLoading();
        return result;
      } catch (error) {
        console.error("Error updating project:", error);
        alert("Failed to update project: " + error.message);
        return null;
      }
    };
  
    const handleDelete = async (id) => {
      try {
        const response = await fetch(`http://localhost:5000/projects/${id}`, {
          method: "DELETE",
        });
  
        if (!response.ok) {
          throw new Error("Failed to delete project");
        }
  
        // Remove the deleted project from the state
        setProjects(projects.filter((project) => project._id !== id));
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project");
      }
    };
  
    const handleEdit = (project) => {
      setEditProject(project);
      setAddProjectOpen(true);
    };
  
    const handleAddProjectOpen = () => {
      setEditProject(null);
      setAddProjectOpen(true);
    };
  
    const handleAddProjectClose = () => {
      setAddProjectOpen(false);
      setEditProject(null);
    };
  
    const handleProjectSubmit = (updatedOrNewProject) => {
      handleAddProjectClose();
    };
  
    // Enhanced skeleton with more random variations for a more natural appearance
    const renderSkeletonCard = (index) => (
      <Grid item xs={1} key={`skeleton-${index}`}>
        <Card
          sx={{
            height: "100%",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
            borderTop: `4px solid ${['#388e3c', '#1976d2', '#d32f2f'][index % 3]}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Status and buttons skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Skeleton variant="text" width={60} height={20} animation="wave" />
              <Box sx={{ display: 'flex' }}>
                <Skeleton variant="circular" width={28} height={28} sx={{ mr: 1 }} animation="wave" />
                <Skeleton variant="circular" width={28} height={28} animation="wave" />
              </Box>
            </Box>
            
            {/* Tags skeleton with varying widths */}
            <Stack direction="row" spacing={1} mt={1} mb={1}>
              <Skeleton variant="rounded" width={40 + Math.random() * 20} height={22} animation="wave" />
              <Skeleton variant="rounded" width={50 + Math.random() * 25} height={22} animation="wave" />
              {index % 3 === 0 && <Skeleton variant="rounded" width={45} height={22} animation="wave" />}
            </Stack>
            
            {/* Title and description with variable widths */}
            <Skeleton variant="text" width={`${70 + Math.random() * 30}%`} height={32} sx={{ mb: 1 }} animation="wave" />
            <Skeleton variant="text" width="100%" height={20} animation="wave" />
            <Skeleton variant="text" width={`${85 + Math.random() * 15}%`} height={20} sx={{ mb: 2 }} animation="wave" />
            
            {/* Dates skeleton */}
            <Skeleton variant="text" width={120} height={16} sx={{ mb: 1 }} animation="wave" />
            <Skeleton variant="text" width={120} height={16} sx={{ mb: 2 }} animation="wave" />
            
            {/* Button skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Skeleton variant="rounded" width={120} height={36} animation="wave" />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={3} columns={{ xs: 1, sm: 2, md: 3 }}>
          {loading ? (
            // Show skeletons while loading
            Array.from({ length: 6 }).map((_, index) => renderSkeletonCard(index))
          ) : projects.length > 0 ? (
            // Show actual project cards with fade-in animation
            projects.map((project, index) => (
              <Grid item xs={1} key={project._id}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
                    borderTop: `4px solid ${
                      project.status === "active"
                        ? "#388e3c"
                        : project.status === "completed"
                        ? "#1976d2"
                        : "#d32f2f"
                    }`,
                    transition: "all 0.3s ease",
                    '&:hover': {
                      boxShadow: "0 12px 20px rgba(95, 150, 230, 0.2)",
                      transform: "translateY(-8px)",
                    },
                    ...fadeInAnimation, // Apply fade-in animation
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          textTransform: "uppercase",
                          color:
                            project.status === "active"
                              ? "#388e3c"
                              : project.status === "completed"
                              ? "#1976d2"
                              : "#d32f2f",
                        }}
                      >
                        {project.status}
                      </Typography>
                      {hasProjectPermission(project) && (
                        <Box>
                          <IconButton
                            onClick={() => handleEdit(project)}
                            color="primary"
                            size="small"
                            aria-label="edit project"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(project._id)}
                            color="error"
                            size="small"
                            aria-label="delete project"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    
                    <Stack direction="row" spacing={1} mt={1} mb={1} flexWrap="wrap">
                      {project.tags?.map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={tag}
                          size="small"
                          sx={{
                            fontSize: "0.65rem",
                            height: 22,
                            backgroundColor: `${getTagColor(idx + 1)}22`,
                            color: getTagColor(idx + 1),
                          }}
                        />
                      ))}
                    </Stack>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {project.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#607080",
                        mb: 2,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {project.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "#607080", mb: 1 }}
                    >
                      Start: {new Date(project.start_date).toLocaleDateString()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "#607080", mb: 2 }}
                    >
                      End: {new Date(project.end_date).toLocaleDateString()}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => router.push(`/current_project/${project._id}`)}
                        sx={{
                          ml: "auto",
                          background: "linear-gradient(to right, #4776E6, #8E54E9)",
                          color: "white",
                          boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                          '&:hover': {
                            background: "linear-gradient(to right, #3a5fc0, #7b1fa2)",
                            boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        View Project
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            // No projects found
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ textAlign: "center", mt: 4 }}>
                No projects found
              </Typography>
            </Grid>
          )}
        </Grid>
  
        {/* Add/Edit Project Dialog Component */}
        <CreateProjectDialog
          open={addProjectOpen}
          onClose={handleAddProjectClose}
          onSubmit={handleProjectSubmit}
          projectToEdit={editProject}
          fetchProjectDetails={fetchProjectDetails}
          clubId={clubId}
          createProject={createProject}
          updateProject={updateProject}
        />
  
        {/* Floating Action Button for adding a new project */}
        {canCreateProjects() && (
          <Fab
            color="primary"
            aria-label="add project"
            onClick={handleAddProjectOpen}
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
              "&:hover": {
                background: "linear-gradient(90deg, #3a5fc0 0%, #7b3fe9 100%)",
                boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
    );
  }