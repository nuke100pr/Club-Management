"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, Edit2, Trash2, Plus,Share } from 'lucide-react';
import { fetchUserData } from '@/utils/auth';
import SearchAndFilter from '../../components/projects/SearchAndFilter';
import CreateProjectDialog from '../../components/projects/CreateProjectDialog';
import { useRouter } from 'next/navigation';
import UniversalShareMenu from '../../components/shared/UniversalShareMenu';
// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Tag component with a single color scheme
const ProjectTag = ({ tag }) => {
  return (
    <span 
      className="inline-block px-2 py-1 mr-2 mb-2 text-xs rounded"
      style={{ 
        backgroundColor: '#4776E620', 
        color: '#4776E6', 
        fontSize: '0.65rem',
        height: '22px',
        display: 'inline-flex',
        alignItems: 'center'
      }}
    >
      {tag}
    </span>
  );
};

// Individual project card component
const ProjectCard = ({ project, hasPermission, handleEdit, handleDelete, router,handleShareClick }) => {
  return (
    <div 
      className="bg-white rounded-2xl p-6 transition-all duration-300 h-full flex flex-col"
      style={{
        boxShadow: '0 4px 12px rgba(95, 150, 230, 0.1)',
        borderTop: `3px solid ${project._id % 2 === 0 ? '#4776E6' : '#8E54E9'}`,
        transform: 'translateY(0)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 20px rgba(95, 150, 230, 0.2)';
        e.currentTarget.style.transform = 'translateY(-8px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(95, 150, 230, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Project Image */}
      {project.image && (
        <div className="mb-4 overflow-hidden rounded-lg cursor-pointer" onClick={() => router.push(`/current_project/${project._id}`)}>
          <img 
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${project.image.filename}`} 
            alt={project.title} 
            className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      {/* Project Title and Actions */}
      <div className="flex justify-between items-start mb-2">
        <h6 
          className="text-xl font-semibold cursor-pointer" 
          style={{ color: '#2A3B4F' }}
          onClick={() => router.push(`/current_project/${project._id}`)}
        >
          {project.title}
        </h6>
        <div className="flex">
    <button 
      onClick={(e) => { e.stopPropagation(); handleShareClick(e, project); }}
      className="text-gray-500 hover:text-blue-600 mr-2"
    >
      <Share size={18} />
    </button>
    {hasPermission && (
      <>
        <button 
          onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
          className="text-gray-500 hover:text-blue-600 mr-2"
        >
          <Edit2 size={18} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
          className="text-gray-500 hover:text-red-600"
        >
          <Trash2 size={18} />
        </button>
      </>
    )}
  </div>
</div>
      
      {/* Status */}
      {/* Status */}
{project.status && (
  <span 
    className="inline-block px-2 py-1 mb-3 text-xs rounded"
    style={{ 
      backgroundColor: 
        project.status === "Running" ? "#FFF7E0" : 
        project.status === "Completed" ? "#E3F9E5" : 
        '#8E54E920', 
      color: 
        project.status === "Running" ? "#FFB100" : 
        project.status === "Completed" ? "#00B869" : 
        '#8E54E9', 
      fontSize: '0.65rem',
      height: '22px',
      display: 'inline-flex',
      alignItems: 'center'
    }}
  >
    {project.status}
  </span>
)}
      
      {/* Description */}
      <p 
        className="mb-4 text-sm flex-grow" 
        style={{ color: '#607080' }}
      >
        {project.description}
      </p>
      
      {/* Project Dates */}
      <div className="mb-4">
        <div className="flex items-center mb-1 text-xs" style={{ color: '#607080' }}>
          <Calendar size={14} className="mr-2" />
          <span className="mr-1">Start:</span>
          <span className="font-medium" style={{ color: '#2A3B4F' }}>
            {formatDate(project.start_date)}
          </span>
        </div>
        
        <div className="flex items-center mb-1 text-xs" style={{ color: '#607080' }}>
          <Calendar size={14} className="mr-2" />
          <span className="mr-1">End:</span>
          <span className="font-medium" style={{ color: '#2A3B4F' }}>
            {formatDate(project.end_date)}
          </span>
        </div>
        
        <div className="flex items-center text-xs" style={{ color: '#607080' }}>
          <Clock size={14} className="mr-2" />
          <span className="mr-1">Posted:</span>
          <span className="font-medium" style={{ color: '#2A3B4F' }}>
            {formatDate(project.created_on)}
          </span>
        </div>
      </div>
      
      {/* Tags */}
      <div className="mt-auto">
        {project.tags && project.tags.map((tag, index) => (
          <ProjectTag key={index} tag={tag} />
        ))}
      </div>
      
      {/* View Details Button */}
      <button
        onClick={() => router.push(`/current_project/${project._id}`)}
        className="mt-4 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        style={{
          backgroundColor: '#4776E610',
          color: '#4776E6',
          border: '1px solid #4776E630'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#4776E620';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#4776E610';
        }}
      >
        View Project Details
      </button>
    </div>
  );
};

// Project grid component
const ProjectsGrid = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: null,
  });
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithProjectPermission, setUserClubsWithProjectPermission] = useState([]);
  const [userBoardsWithProjectPermission, setUserBoardsWithProjectPermission] = useState([]);
  const router = useRouter();

  const [shareMenu, setShareMenu] = useState({
      open: false,
      anchorEl: null,
      id: null,
      title: "",
      contentType: "project"
    });
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
            .filter(boardId => result.userData.data.boards[boardId].projects === true);
          setUserBoardsWithProjectPermission(boardsWithPermission);
        }
      }
    }
    loadUserData();
    fetchProjects();
  }, []);
  const handleShareClose = () => {
    setShareMenu({
      ...shareMenu,
      open: false,
      anchorEl: null
    });
  };
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
      const boardId = project.board_id._id || project.board_id;
      if (userBoardsWithProjectPermission.includes(boardId)) {
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

  // Fetch projects from backend
  const fetchProjects = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/api/`, {
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/${projectId}`
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
  const handleShareClick = (event, project) => {
    setShareMenu({
      open: true,
      anchorEl: event.currentTarget,
      id: project._id,
      title: project.title
    });
  };
  const createProject = async (formData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/`, {
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/${projectId}`,
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/${id}`, {
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
      (!filters.status || project.status === filters.status)
  );

  return (
    <div 
  className="px-20 py-15 min-h-screen" // Changed from "p-8 min-h-screen"
  style={{ backgroundColor: '#f8faff' }}
>

      
      <SearchAndFilter
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
        {filteredProjects.map(project => (
          <ProjectCard 
            key={project._id} 
            project={project} 
            hasPermission={hasProjectPermission(project)}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            router={router}
            handleShareClick={handleShareClick} 
          />
        ))}
      </div>
      
      {/* Add/Edit Project Dialog Component */}
      <CreateProjectDialog
        open={addProjectOpen}
        onClose={handleAddProjectClose}
        onSubmit={handleProjectSubmit}
        projectToEdit={editProject}
        fetchProjectDetails={fetchProjectDetails}
        createProject={createProject}
        updateProject={updateProject}
      />
      {/* Universal Share Menu */}
<UniversalShareMenu
  anchorEl={shareMenu.anchorEl}
  open={shareMenu.open}
  onClose={handleShareClose}
  id={shareMenu.id}
  title={shareMenu.title}
  contentType="project"
/>
    </div>
  );
};

export default ProjectsGrid;