const projectService = require("../services/projectService");

// Event Controllers
const createProject = async (req, res) => {
  try {
    const projectData = req.body;
    const imageFile = req.file; // Assuming you're using multer for file uploads

    const newProject = await projectService.createProject(
      projectData,
      imageFile
    );
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getProject = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.status(200).json(project);
  } catch (error) {
    if (error.message === "Project not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const updateData = req.body;
    const imageFile = req.file; // Get the uploaded file from multer

    const updatedProject = await projectService.updateProject(
      projectId, 
      updateData, 
      imageFile
    );
    
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    if (error.message === "Project not found") {
      res.status(404).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await projectService.deleteProject(req.params.id);
    res.status(200).json(project);
  } catch (error) {
    if (error.message === "Project not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Project Application Controllers
const applyForProject = async (req, res) => {
  try {
    const application = await projectService.applyForProject(
      req.user._id, // Assuming user ID is available from auth middleware
      req.params.projectId
    );
    res.status(201).json(application);
  } catch (error) {
    if (
      error.message.includes("already applied") ||
      error.message.includes("already a member")
    ) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

const getApplicationsForProject = async (req, res) => {
  try {
    const applications = await projectService.getProjectApplications(
      req.params.projectId
    );
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserApplications = async (req, res) => {
  try {
    const applications = await projectService.getUserApplications(req.user._id);
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const result = await projectService.deleteApplication(
      req.params.applicationId
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Application not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Project Member Controllers
const addMember = async (req, res) => {
  try {
    const member = await projectService.addProjectMember(
      req.params.projectId,
      req.params.userId
    );
    res.status(201).json(member);
  } catch (error) {
    if (error.message.includes("already a member")) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

const removeMember = async (req, res) => {
  try {
    const result = await projectService.removeProjectMember(
      req.params.projectId,
      req.params.userId
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Project member not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const getProjectMembers = async (req, res) => {
  try {
    const members = await projectService.getProjectMembers(
      req.params.projectId
    );
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserProjects = async (req, res) => {
  try {
    const projects = await projectService.getUserProjects(req.params.userId);
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  // Project controllers
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getAllProjects,

  // Application controllers
  applyForProject,
  getApplicationsForProject,
  getUserApplications,
  withdrawApplication,

  // Member controllers
  addMember,
  removeMember,
  getProjectMembers,
  getUserProjects,
};
