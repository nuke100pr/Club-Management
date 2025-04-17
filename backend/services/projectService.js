const Project = require("../models/Project");
const ProjectApply = require("../models/ProjectApply");
const ProjectMembers = require("../models/ProjectMembers");
const File = require("../models/File");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const saveFile = async (file) => {
  if (!file || !file.buffer) {
    console.error("Error: No file buffer provided");
    return null;
  }

  const { originalname, mimetype, buffer, size } = file; // Ensure file.buffer is available
  const filename = `${Date.now()}-${originalname.replace(/\s+/g, "_")}`; // Replace spaces to avoid issues
  const filePath = path.join(uploadDir, filename);

  console.log("Filename:", filename);
  console.log("Saving file to:", filePath);

  try {
    fs.writeFileSync(filePath, buffer);
    console.log("File saved successfully:", filePath);
  } catch (error) {
    console.error("Error writing file:", error);
    return null;
  }

  try {
    const newFile = new File({
      filename,
      originalName: originalname,
      path: filePath,
      fileType: mimetype.startsWith("image") ? "image" : "video",
      mimeType: mimetype,
      size, // Corrected: Use size directly
    });

    await newFile.save();
    return newFile._id;
  } catch (error) {
    console.error("Error saving file to database:", error);
    return null;
  }
};

const createProject = async (projectData, imageFile) => {
  try {
    // If there's an image file, save it and get the file ID
    if (imageFile) {
      const fileId = await saveFile(imageFile);
      projectData.image = fileId;
    }

    const newProject = new Project(projectData);
    await newProject.save();

    return newProject;
  } catch (error) {
    // Clean up the uploaded file if event creation fails
    if (imageFile && projectData.image) {
      try {
        const filePath = path.join(uploadDir, imageFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }
    throw new Error(`Error creating event: ${error.message}`);
  }
};

const getAllProjects = async (filters = {}) => {
  try {
    // Build the query based on provided filters
    const query = {};

    if (filters.board_id) {
      query.board_id = filters.board_id;
    }

    if (filters.club_id) {
      query.club_id = filters.club_id;
    }

    const projects = await Project.find(query).populate("image");
    return projects;
  } catch (error) {
    throw new Error(`Error fetching all projects: ${error.message}`);
  }
};

const getProjectById = async (projectId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) throw new Error("Project not found");
    return project;
  } catch (error) {
    throw new Error(`Error fetching project: ${error.message}`);
  }
};

const updateProject = async (projectId, updateData, imageFile) => {
  try {
    let project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Handle image update if new image is provided
    if (imageFile) {
      // Save the new file
      const fileId = await saveFile(imageFile);

      // If there was a previous image, delete the old file
      if (project.image) {
        try {
          const oldFile = await File.findById(project.image);
          if (oldFile) {
            const oldFilePath = path.join(uploadDir, oldFile.filename);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
            await File.findByIdAndDelete(project.image);
          }
        } catch (cleanupError) {
          console.error("Error cleaning up old file:", cleanupError);
        }
      }

      updateData.image = fileId;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      throw new Error("Project not found");
    }

    return updatedProject;
  } catch (error) {
    // Clean up the uploaded file if update fails
    if (imageFile && updateData.image) {
      try {
        const filePath = path.join(uploadDir, imageFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }
    throw new Error(`Error updating project: ${error.message}`);
  }
};

const deleteProject = async (projectId) => {
  try {
    const project = await Project.findByIdAndDelete(projectId);
    if (!project) throw new Error("Project not found");

    // Clean up related data
    await ProjectApply.deleteMany({ project_id: projectId });
    await ProjectMembers.deleteMany({ project_id: projectId });

    return project;
  } catch (error) {
    throw new Error(`Error deleting project: ${error.message}`);
  }
};

// ProjectApply Services
const applyForProject = async (userId, projectId) => {
  try {
    // Check if already applied or is member
    const existingApply = await ProjectApply.findOne({
      user_id: userId,
      project_id: projectId,
    });
    if (existingApply)
      throw new Error("User has already applied to this project");

    const existingMember = await ProjectMembers.findOne({
      user_id: userId,
      project_id: projectId,
    });
    if (existingMember)
      throw new Error("User is already a member of this project");

    const application = new ProjectApply({
      user_id: userId,
      project_id: projectId,
    });
    await application.save();
    return application;
  } catch (error) {
    throw new Error(`Error applying for project: ${error.message}`);
  }
};

const getProjectApplications = async (projectId) => {
  try {
    return await ProjectApply.find({ project_id: projectId }).populate(
      "user_id"
    );
  } catch (error) {
    throw new Error(`Error fetching applications: ${error.message}`);
  }
};

const getUserApplications = async (userId) => {
  try {
    return await ProjectApply.find({ user_id: userId }).populate("project_id");
  } catch (error) {
    throw new Error(`Error fetching user applications: ${error.message}`);
  }
};

const deleteApplication = async (applicationId) => {
  try {
    const application = await ProjectApply.findByIdAndDelete(applicationId);
    if (!application) throw new Error("Application not found");
    return application;
  } catch (error) {
    throw new Error(`Error deleting application: ${error.message}`);
  }
};

// ProjectMembers Services
const addProjectMember = async (projectId, userId) => {
  try {
    // Check if already a member
    const existingMember = await ProjectMembers.findOne({
      project_id: projectId,
      user_id: userId,
    });
    if (existingMember)
      throw new Error("User is already a member of this project");

    const member = new ProjectMembers({
      project_id: projectId,
      user_id: userId,
      added_on: new Date().toISOString(),
    });
    await member.save();

    // Remove any existing application
    await ProjectApply.deleteMany({
      project_id: projectId,
      user_id: userId,
    });

    return member;
  } catch (error) {
    throw new Error(`Error adding project member: ${error.message}`);
  }
};

const removeProjectMember = async (projectId, userId) => {

  console.log(projectId);
  console.log(userId);
  try {
    const member = await ProjectMembers.findOneAndDelete({
      project_id: projectId,
      user_id: userId,
    });
    if (!member) throw new Error("Project member not found");
    return member;
  } catch (error) {
    throw new Error(`Error removing project member: ${error.message}`);
  }
};

const getProjectMembers = async (projectId) => {
  try {
    return await ProjectMembers.find({ project_id: projectId }).populate(
      "user_id"
    );
  } catch (error) {
    throw new Error(`Error fetching project members: ${error.message}`);
  }
};

const getUserProjects = async (userId) => {
  try {
    return await ProjectMembers.find({ user_id: userId }).populate(
      "project_id"
    );
  } catch (error) {
    throw new Error(`Error fetching user projects: ${error.message}`);
  }
};

module.exports = {
  // Project services
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjects,

  // ProjectApply services
  applyForProject,
  getProjectApplications,
  getUserApplications,
  deleteApplication,

  // ProjectMembers services
  addProjectMember,
  removeProjectMember,
  getProjectMembers,
  getUserProjects,
};
