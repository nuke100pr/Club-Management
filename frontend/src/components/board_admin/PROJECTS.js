"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Stack,
  Grid,
  Avatar,
  AvatarGroup,
  TextField,
  Container,
  InputAdornment,
  Paper,
  useTheme,
  alpha,
  styled,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import { useRouter } from "next/navigation";
import { fetchUserData } from "@/utils/auth";
import CreateProjectDialog from "../../components/projects/CreateProjectDialog";

// Standardized theme colors to match Resources page
const themeColors = {
  primary: {
    main: "#3f51b5",
    light: "#757de8",
    dark: "#002984",
  },
  secondary: {
    main: "#f50057",
  },
  background: {
    default: "#f5f7fa",
    paper: "#ffffff",
  },
  text: {
    primary: "#212121",
    secondary: "#757575",
  },
  status: {
    active: "#4caf50",
    completed: "#2196f3",
    planning: "#ff9800",
    inactive: "#9e9e9e",
  },
};

// Standardized card styling to match Resources page
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  },
}));

const StatusChip = styled(Chip)(({ status }) => {
  const colors = {
    Active: themeColors.status.active,
    Completed: themeColors.status.completed,
    Planning: themeColors.status.planning,
    inactive: themeColors.status.inactive,
  };

  return {
    backgroundColor: alpha(colors[status] || colors.inactive, 0.1),
    color: colors[status] || colors.inactive,
    borderRadius: "12px",
    border: `1px solid ${colors[status] || colors.inactive}`,
    fontWeight: 500,
    fontSize: "0.7rem",
  };
});

const ViewButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  borderRadius: "8px",
  padding: "6px 12px",
  fontSize: "0.8rem",
  textTransform: "none",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const TagChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontSize: "0.7rem",
  height: "24px",
  marginRight: "4px",
  marginBottom: "4px",
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: theme.palette.text.secondary,
  marginBottom: "8px",
  fontSize: "0.8rem",
  "& svg": {
    fontSize: "16px",
    color: theme.palette.primary.main,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: theme.palette.background.paper,
    "& fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.2),
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const ProjectCard = ({
  project,
  handleEdit,
  handleDelete,
  hasProjectPermission,
  isSuperAdmin,
  router,
}) => {
  return (
    <StyledCard>
      <CardMedia
        component="img"
        height="160"
        image={
          project.image
            ? `http://localhost:5000/uploads/${project.image.filename}`
            : "/placeholder-project.png"
        }
        alt={project.title}
        sx={{ objectFit: "cover" }}
      />

      <CardContent sx={{ flexGrow: 1, padding: "16px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: "12px",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            fontWeight="600"
            sx={{ fontSize: "1rem" }}
          >
            {project.title}
          </Typography>
          <StatusChip
            label={project.status || "Planning"}
            status={project.status || "Planning"}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: "12px",
            fontSize: "0.8rem",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description}
        </Typography>

        <Box sx={{ mb: "12px" }}>
          <InfoItem>
            <CalendarTodayIcon fontSize="small" />
            <span>
              Start: {new Date(project.start_date).toLocaleDateString()}
            </span>
          </InfoItem>

          <InfoItem>
            <EventAvailableIcon fontSize="small" />
            <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
          </InfoItem>

          {project.club_id && (
            <InfoItem>
              <WorkspacesIcon fontSize="small" />
              <span>{project.club_id.name}</span>
            </InfoItem>
          )}
        </Box>

        {project.tags?.length > 0 && (
          <Box sx={{ mb: "12px" }}>
            <Stack direction="row" flexWrap="wrap">
              {project.tags.map((tag, index) => (
                <TagChip key={index} label={tag} size="small" />
              ))}
            </Stack>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <AvatarGroup
            max={4}
            sx={{
              "& .MuiAvatar-root": {
                width: 28,
                height: 28,
                fontSize: "0.8rem",
              },
            }}
          >
            {Array.from({ length: project.members || 0 }, (_, i) => (
              <Avatar
                key={i}
                alt={`Member ${i + 1}`}
                src="/placeholder-avatar.png"
              />
            ))}
          </AvatarGroup>

          <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {(isSuperAdmin || hasProjectPermission(project)) && (
              <>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(project);
                  }}
                  size="small"
                  sx={{ color: "primary.main" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project._id);
                  }}
                  size="small"
                  sx={{ color: "error.main" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            )}
            <ViewButton
              size="small"
              startIcon={<GroupIcon fontSize="small" />}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/projects/${project._id}/members`);
              }}
            >
              Members
            </ViewButton>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

const ProjectsPage = ({ boardId }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
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
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      try {
        // Fetch user data
        let result = await fetchUserData();
        if (result) {
          setUserData(result.userData);
          setUserId(result.userId);
          setIsSuperAdmin(result.isSuperAdmin);
        }

        // Fetch projects
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
         result = await response.json();
        if (!Array.isArray(result)) throw new Error("Invalid projects data");

        setProjects(result);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
        setIsLoading(false);
        setNotification({
          open: true,
          message: "Failed to load data: " + error.message,
          severity: "error",
        });
      }
    };

    fetchUserAndProjects();
  }, [user_id, boardId]);

  const hasProjectPermission = (project) => {
    if (isSuperAdmin) return true;
    if (!userData) return false;

    // Check club permissions
    if (project.club_id && userData.clubs?.[project.club_id._id]?.projects) {
      return true;
    }

    // Check board permissions
    if (project.board_id && userData.boards?.[project.board_id._id]?.projects) {
      return true;
    }

    return false;
  };

  const canCreateProjects = () => {
    if (isSuperAdmin) return true;
    if (boardId && userData?.boards?.[boardId]?.projects) return true;
    return false;
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

  const handleEdit = (project) => {
    setCurrentProject(project);
    setEditFormData({
      title: project.title,
      description: project.description,
      status: project.status || "Planning",
      start_date: new Date(project.start_date).toISOString().slice(0, 10),
      end_date: new Date(project.end_date).toISOString().slice(0, 10),
      tags: project.tags || [],
      club_id: project.club_id?._id,
      board_id: project.board_id?._id,
      image: project.image || null,
    });
    setIsEditing(true);
    setOpenDialog(true);
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

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("start_date", formData.start_date);
      formDataToSend.append("end_date", formData.end_date);

      if (formData.tags) {
        formData.tags.forEach((tag) => formDataToSend.append("tags", tag));
      }

      if (formData.club_id) formDataToSend.append("club_id", formData.club_id);
      if (formData.board_id)
        formDataToSend.append("board_id", formData.board_id);
      if (formData.image) formDataToSend.append("image", formData.image);

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      let result = await response.json();

      if (isEditing) {
        setProjects(
          projects.map((p) => (p._id === currentProject._id ? result : p))
        );
      } else {
        setProjects([result, ...projects]);
      }

      setOpenDialog(false);
      setNotification({
        open: true,
        message: isEditing ? "Project updated" : "Project created",
        severity: "success",
      });
    } catch (error) {
      console.error("Error submitting project:", error);
      setNotification({
        open: true,
        message: "Failed to save project",
        severity: "error",
      });
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.tags &&
        project.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  if (isLoading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" component="h1" fontWeight="600">
            Projects
          </Typography>
          {canCreateProjects() && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ borderRadius: "8px" }}
            >
              New Project
            </Button>
          )}
        </Box>

        <SearchField
          fullWidth
          placeholder="Search projects..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {filteredProjects.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No projects found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project._id}>
                <ProjectCard
                  project={project}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  hasProjectPermission={hasProjectPermission}
                  isSuperAdmin={isSuperAdmin}
                  router={router}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <CreateProjectDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleFormSubmit}
        initialData={
          editFormData || {
            title: "",
            description: "",
            status: "Planning",
            start_date: "",
            end_date: "",
            tags: [],
            club_id: "",
            board_id: boardId || "",
            image: null,
          }
        }
        title={isEditing ? "Edit Project" : "Create Project"}
        submitButtonText={isEditing ? "Update" : "Create"}
        boardId={boardId}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectsPage;
