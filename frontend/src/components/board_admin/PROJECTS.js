"use client";
import { useState, useEffect } from "react";
import { fetchUserData } from "@/utils/auth";
import { useRouter } from "next/navigation";
import CreateProjectDialog from "../../components/projects/CreateProjectDialog";
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  FormControl, 
  FormControlLabel, 
  Checkbox, 
  Grid, 
  Chip, 
  IconButton, 
  Snackbar, 
  Alert, 
  Divider,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

export default function PROJECTS({ boardId }) {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [user_id, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithProjectPermission, setUserClubsWithProjectPermission] = useState([]);
  const [userBoardsWithProjectPermission, setUserBoardsWithProjectPermission] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        if (result.userData?.data?.clubs) {
          const clubsWithPermission = Object.keys(
            result.userData.data?.clubs
          ).filter(
            (clubId) => result.userData.data?.clubs[clubId].projects === true
          );
          setUserClubsWithProjectPermission(clubsWithPermission);
        }

        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData?.data?.boards
          ).filter(
            (boardId) => result.userData?.data?.boards[boardId].projects === true
          );
          setUserBoardsWithProjectPermission(boardsWithPermission);
        }
      }
    }
    loadUserData();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        let url = user_id
          ? `http://localhost:5000/projects/api?userId=${user_id}`
          : `http://localhost:5000/projects/api`;

        if (boardId) {
          url += (url.includes("?") ? "&" : "?") + `boardId=${boardId}`;
        }

        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (!Array.isArray(result)) throw new Error("Invalid projects data");

        setProjects(result);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setError(error.message);
        setIsLoading(false);
        setNotification({
          open: true,
          message: "Failed to load projects: " + error.message,
          severity: "error",
        });
      }
    };

    fetchProjects();
  }, [user_id, boardId, isEditing]);

  const canCreateProjects = () => {
    if (boardId) {
      if (userBoardsWithProjectPermission.includes(boardId)) {
        return true;
      }
    }
    return isSuperAdmin;
  };

  const hasProjectPermission = (project) => {
    if (isSuperAdmin) return true;

    const hasClubPermission =
      project.club_id &&
      userData?.clubs?.[project.club_id._id || project.club_id]?.projects === true;

    const hasBoardPermission =
      project.board_id &&
      userData?.boards?.[project.board_id._id || project.board_id]?.projects === true;

    return hasClubPermission || hasBoardPermission;
  };

  const handleFilterChange = (event) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({});
  };

  const handleDelete = async (projectId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      setProjects(projects.filter((project) => project._id !== projectId));
      setNotification({
        open: true,
        message: "Project deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to delete project:", error);
      setNotification({
        open: true,
        message: "Failed to delete project",
        severity: "error",
      });
    }
  };

  const handleEdit = async (project) => {
    try {
      const response = await fetch(
        `http://localhost:5000/projects/${project._id}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const projectDetails = result;

      const formData = {
        title: projectDetails.title,
        description: projectDetails.description,
        status: projectDetails.status || "Planning",
        start_date: new Date(projectDetails.start_date).toISOString().slice(0, 10),
        end_date: new Date(projectDetails.end_date).toISOString().slice(0, 10),
        tags: projectDetails.tags || [],
        club_id: projectDetails.club_id?._id,
        board_id: projectDetails.board_id?._id,
        image: projectDetails.image || null,
      };

      setCurrentProject(project);
      setEditFormData(formData);
      setIsEditing(true);
      setOpenDialog(true);
    } catch (error) {
      console.error("Failed to fetch project details:", error);
      setNotification({
        open: true,
        message: "Failed to fetch project details",
        severity: "error",
      });
    }
  };

  const handleAddNew = () => {
    setCurrentProject(null);
    setEditFormData(null);
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = isEditing
        ? `http://localhost:5000/projects/${currentProject._id}`
        : "http://localhost:5000/projects";
      const method = isEditing ? "PUT" : "POST";

      const multipartFormData = new FormData();
      multipartFormData.append("title", formData.title);
      multipartFormData.append("description", formData.description);
      multipartFormData.append("status", formData.status);
      multipartFormData.append("start_date", formData.start_date);
      multipartFormData.append("end_date", formData.end_date);
      
      if (formData.tags) {
        formData.tags.forEach((tag) => {
          multipartFormData.append("tags", tag);
        });
      }

      multipartFormData.append("club_id", formData.club_id);
      multipartFormData.append("board_id", formData.board_id);

      if (formData.image instanceof File) {
        multipartFormData.append("image", formData.image);
      } else if (formData.image && typeof formData.image === "string") {
        multipartFormData.append("image", formData.image);
      }

      if (isEditing && currentProject) {
        multipartFormData.append("_id", currentProject._id);
      }

      const response = await fetch(url, {
        method: method,
        body: multipartFormData,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const updatedProject = await response.json();

      if (isEditing && currentProject) {
        setProjects(
          projects.map((project) =>
            project._id === currentProject._id
              ? {
                  ...project,
                  ...updatedProject,
                }
              : project
          )
        );
      } else {
        setProjects([updatedProject, ...projects]);
      }

      setOpenDialog(false);
      setEditFormData(null);
      setIsEditing(false);
      setNotification({
        open: true,
        message: isEditing
          ? "Project updated successfully"
          : "Project created successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to submit project:", error);
      setNotification({
        open: true,
        message: "Failed to save project",
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const filteredProjects = projects.filter((project) => {
    if (boardId) {
      const projectBoardId = project.board_id?._id || project.board_id;
      if (projectBoardId !== boardId) return false;
    }

    const matchesSearch = searchQuery
      ? project.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const hasActiveFilters = Object.values(selectedFilters).some(Boolean);

    if (!hasActiveFilters) {
      return matchesSearch;
    }

    const matchesClubFilter = selectedFilters["My Clubs"]
      ? project.isClubFollowed
      : true;
    const matchesBoardFilter = selectedFilters["My Boards"]
      ? project.isBoardFollowed
      : true;
    const matchesStatusFilter =
      (selectedFilters["Active"] && project.status === "Active") ||
      (selectedFilters["Completed"] && project.status === "Completed") ||
      (selectedFilters["Upcoming"] && project.status === "Upcoming");

    return (
      matchesSearch &&
      matchesClubFilter &&
      matchesBoardFilter &&
      (!selectedFilters["Active"] || project.status === "Active") &&
      (!selectedFilters["Completed"] || project.status === "Completed") &&
      (!selectedFilters["Upcoming"] || project.status === "Upcoming")
    );
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  return (
    <Container>
      {boardId && (
        <Box>
          <Typography variant="h4">Board Projects</Typography>
        </Box>
      )}

      <Box display="flex">
        <Box width="25%" padding="10px">
          <TextField
            placeholder="Search projects"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {!boardId && (
            <Box marginTop="20px">
              <Typography variant="h6">Filter Projects</Typography>
              <Box>
                {["My Clubs", "My Boards", "Active", "Completed", "Upcoming"].map((filter) => (
                  <FormControlLabel
                    key={filter}
                    control={
                      <Checkbox
                        name={filter}
                        checked={selectedFilters[filter] || false}
                        onChange={handleFilterChange}
                      />
                    }
                    label={filter}
                  />
                ))}
              </Box>
              {Object.values(selectedFilters).some(Boolean) && (
                <Button onClick={clearFilters}>Clear All Filters</Button>
              )}
            </Box>
          )}
        </Box>

        <Box width="75%" padding="10px">
          {filteredProjects.length === 0 ? (
            <Box textAlign="center" padding="20px">
              <Typography variant="h5">No Projects Found</Typography>
              <Typography>
                {searchQuery || Object.values(selectedFilters).some(Boolean)
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by creating your first project."}
              </Typography>
              {canCreateProjects() && (
                <Button onClick={handleAddNew}>Create New Project</Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredProjects.map((project) => (
                <Grid item xs={4} key={project._id}>
                  <Card onClick={(e) => {
                    if (e.target.closest('button')) return;
                    router.push(`/current_project/${project._id}`);
                  }}>
                    {project.image && (
                      <Box>
                        <CardMedia
                          component="img"
                          image={`http://localhost:5000/uploads/${project.image.filename}`}
                          alt={project.title}
                        />
                        <Chip
                          label={project.status || "Planning"}
                        />
                      </Box>
                    )}

                    <CardContent>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6">{project.title}</Typography>
                        {(isSuperAdmin || hasProjectPermission(project)) && (
                          <Box>
                            <IconButton onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(project);
                            }}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(project._id);
                            }}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      <Typography>{project.description}</Typography>

                      {project.club_id && (
                        <Box>
                          <Typography component="span" fontWeight="bold">Club:</Typography>{" "}
                          <Typography component="span">{project.club_id?.name || project.club_id}</Typography>
                        </Box>
                      )}

                      {project.board_id && (
                        <Box>
                          <Typography component="span" fontWeight="bold">Board:</Typography>{" "}
                          <Typography component="span">{project.board_id?.name || project.board_id}</Typography>
                        </Box>
                      )}

                      <Box>
                        <Typography component="span" fontWeight="bold">Dates:</Typography>{" "}
                        <Typography component="span">
                          {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {project.tags && project.tags.length > 0 && (
                        <Box>
                          <Typography component="span" fontWeight="bold">Tags:</Typography>{" "}
                          <Typography component="span">{project.tags.join(", ")}</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {canCreateProjects() && (
        <Fab onClick={handleAddNew}>
          <AddIcon />
        </Fab>
      )}

      <CreateProjectDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setIsEditing(false);
          setEditFormData(null);
        }}
        onSubmit={handleFormSubmit}
        isEditing={isEditing}
        initialData={editFormData}
        boardId={boardId}
        userClubs={userClubsWithProjectPermission}
        userBoards={userBoardsWithProjectPermission}
        isSuperAdmin={isSuperAdmin}
      />

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}