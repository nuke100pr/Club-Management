"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Grid,
  Box,
  Fab,
  Chip,
  Divider,
  Paper,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CreateProjectDialog from "../../components/projects/CreateProjectDialog";
import { fetchUserData } from "@/utils/auth";

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

const PROJECTS = ({ clubId }) => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    club: null,
    board: clubId || null, // Initialize with the passed clubId
    status: null,
  });
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithProjectPermission, setUserClubsWithProjectPermission] =
    useState([]);
  const [userBoardsWithProjectPermission, setUserBoardsWithProjectPermission] =
    useState([]);

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
          const clubsWithPermission = Object.keys(
            result.userData.data.clubs
          ).filter(
            (clubId) => result.userData.data.clubs[clubId].projects === true
          );
          setUserClubsWithProjectPermission(clubsWithPermission);
        }

        // Extract boards with projects permission
        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData.data.boards
          ).filter(
            (clubId) => result.userData.data.boards[clubId].projects === true
          );
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
    if (project.club_id) {
      const clubId = project.club_id._id || project.club_id;
      if (userBoardsWithProjectPermission.includes(clubId)) {
        return true;
      }
    }

    return false;
  };

  // Check if user can create projects
  const canCreateProjects = () => {
    if (clubId) {
      // If viewing a specific board, check if user has permission for that board
      return isSuperAdmin || userBoardsWithProjectPermission.includes(clubId);
    }
    return (
      isSuperAdmin ||
      userClubsWithProjectPermission.length > 0 ||
      userBoardsWithProjectPermission.length > 0
    );
  };

  // Fetch projects from backend
  useEffect(() => {
    fetchProjects();
  }, [clubId]); // Add clubId to dependency array

  const fetchProjects = async () => {
    try {
      let url = "http://localhost:5000/projects/api/";
      if (clubId) {
        url += `?club_id=${clubId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

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
      // If we're in board-specific view, automatically set the club_id
      if (clubId) {
        formData.append("club_id", clubId);
      }

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
      await fetchProjects();
      return result;
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project: " + error.message);
      return null;
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
      await fetchProjects();
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

  const handleSearchChange = (searchText) => {
    setSearch(searchText);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(search.toLowerCase()) &&
      (!filters.club || project.club_id === filters.club) &&
      (!filters.board || project.club_id === filters.board) &&
      (!filters.status || project.status === filters.status)
  );

  return (
    <div>
      <>
        <Grid container spacing={2} sx={{ p: 2 }}>
          {/* Left Panel - Search Bar (Fixed, Non-Scrollable) */}
          {!clubId && (
            <Grid item xs={12} sm={3}>
              <Paper
                sx={{
                  p: 2,
                  position: "sticky",
                  top: 80, // Ensures it stays below any navbar
                  maxHeight: "90vh",
                  overflow: "auto",
                  boxShadow: 3, // Moderate elevation
                  borderRadius: 2,
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Search Projects"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </Paper>
            </Grid>
          )}

          {/* Project Cards */}
          <Grid item xs={12} sm={clubId ? 12 : 9}>
            <Grid container spacing={2}>
              {filteredProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project._id}>
                  <Card
                    sx={{
                      borderRadius: "12px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: (theme) => theme.shadows[6],
                      },
                    }}
                  >
                    {/* Project Image */}
                    {project.image && (
                      <CardMedia
                        component="img"
                        sx={{
                          height: 200,
                          width: "100%",
                          objectFit: "cover",
                          mb: 2,
                          borderRadius: "12px 12px 0 0",
                        }}
                        image={`http://localhost:5000/uploads/${project.image.filename}`}
                        alt={project.title}
                      />
                    )}

                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Header Section */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" component="div">
                          {project.title}
                        </Typography>
                        {hasProjectPermission(project) && (
                          <Box>
                            <IconButton
                              onClick={() => handleEdit(project)}
                              color="primary"
                              size="small"
                              aria-label="edit project"
                              sx={{
                                "&:hover": {
                                  backgroundColor: "primary.light",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(project._id)}
                              color="error"
                              size="small"
                              aria-label="delete project"
                              sx={{
                                "&:hover": {
                                  backgroundColor: "error.light",
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      {/* Status Chip */}
                      {project.status && (
                        <Chip
                          label={project.status}
                          size="small"
                          sx={{
                            mb: 2,
                            backgroundColor: getTagColor(0),
                            color: "white",
                          }}
                        />
                      )}

                      <Divider sx={{ my: 2, bgcolor: "divider" }} />

                      {/* Project Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {project.description}
                      </Typography>

                      {/* Project Details */}
                      <Box sx={{ width: "100%" }}>
                        <Typography variant="body2" color="text.secondary">
                          <Box component="span" sx={{ fontWeight: "bold" }}>
                            Start:
                          </Box>{" "}
                          {new Date(project.start_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <Box component="span" sx={{ fontWeight: "bold" }}>
                            End:
                          </Box>{" "}
                          {new Date(project.end_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <Box component="span" sx={{ fontWeight: "bold" }}>
                            Created:
                          </Box>{" "}
                          {new Date(project.created_on).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {/* Tags Section */}
                      {project.tags && project.tags.length > 0 && (
                        <>
                          <Divider sx={{ my: 2, bgcolor: "divider" }} />
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              mt: 2,
                            }}
                          >
                            {project.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                sx={{
                                  backgroundColor: getTagColor(index + 1), // +1 to skip status color
                                  color: "white",
                                }}
                              />
                            ))}
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Add/Edit Project Dialog Component */}
        <CreateProjectDialog
          open={addProjectOpen}
          onClose={handleAddProjectClose}
          onSubmit={handleProjectSubmit}
          projectToEdit={editProject}
          fetchProjectDetails={fetchProjectDetails}
          createProject={createProject}
          updateProject={updateProject}
          clubId={clubId} // Pass the clubId to the dialog
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
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            <AddIcon />
          </Fab>
        )}
      </>
    </div>
  );
};

export default PROJECTS;
