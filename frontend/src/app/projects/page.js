"use client";
import React, { useState, useEffect,useMemo } from 'react';
import { Calendar, Clock, Tag, Edit2, Trash2, Plus, Share } from 'lucide-react';
import { fetchUserData,hasPermission } from '@/utils/auth';
import SearchAndFilter from '../../components/projects/SearchAndFilter';
import CreateProjectDialog from '../../components/projects/CreateProjectDialog';
import { useRouter } from 'next/navigation';
import UniversalShareMenu from '../../components/shared/UniversalShareMenu';
import { useTheme } from '@mui/material/styles';

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Tag component with dynamic color based on theme
const ProjectTag = ({ tag }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <span 
      className="inline-block px-2 py-1 mr-2 mb-2 text-xs rounded"
      style={{ 
        backgroundColor: isDark ? '#5d8aff30' : '#4776E620', 
        color: isDark ? '#78a6ff' : '#4776E6', 
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
const ProjectCard = ({ project, hasPermission, handleEdit, handleDelete, router, handleShareClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Dynamic color values based on theme
  const cardBg = isDark ? '#1e2a3a' : '#ffffff';
  const cardBorder = project._id % 2 === 0 ? (isDark ? '#5d8aff' : '#4776E6') : (isDark ? '#b17eff' : '#8E54E9');
  const cardShadow = isDark ? 'rgba(0, 10, 60, 0.3)' : 'rgba(95, 150, 230, 0.1)';
  const cardShadowHover = isDark ? 'rgba(0, 10, 60, 0.5)' : 'rgba(95, 150, 230, 0.2)';
  const textPrimary = isDark ? '#e0e6f0' : '#2A3B4F';
  const textSecondary = isDark ? '#a0aec0' : '#607080';
  const buttonBg = isDark ? '#2d3748' : '#4776E610';
  const buttonBgHover = isDark ? '#3a4a5e' : '#4776E620';
  const buttonColor = isDark ? '#78a6ff' : '#4776E6';
  const buttonBorder = isDark ? '#3a4a5e' : '#4776E630';

  // Status colors
  const getStatusColors = (status) => {
    if (status === "Running") {
      return {
        bg: isDark ? '#413100' : '#FFF7E0',
        color: isDark ? '#ffc940' : '#FFB100'
      };
    } else if (status === "Completed") {
      return {
        bg: isDark ? '#0a3622' : '#E3F9E5',
        color: isDark ? '#2ae886' : '#00B869'
      };
    } else {
      return {
        bg: isDark ? '#321b5a' : '#8E54E920', 
        color: isDark ? '#b17eff' : '#8E54E9'
      };
    }
  };

  return (
    <div 
      className="rounded-2xl p-6 transition-all duration-300 h-full flex flex-col"
      style={{
        backgroundColor: cardBg,
        boxShadow: `0 4px 12px ${cardShadow}`,
        borderTop: `3px solid ${cardBorder}`,
        transform: 'translateY(0)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 12px 20px ${cardShadowHover}`;
        e.currentTarget.style.transform = 'translateY(-8px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 12px ${cardShadow}`;
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
          style={{ color: textPrimary }}
          onClick={() => router.push(`/current_project/${project._id}`)}
        >
          {project.title}
        </h6>
        <div className="flex">
          <button 
            onClick={(e) => { e.stopPropagation(); handleShareClick(e, project); }}
            className={`hover:text-blue-600 mr-2`}
            style={{ color: isDark ? '#a0aec0' : '#64748b' }}
          >
            <Share size={18} />
          </button>
          {hasPermission[project._id] && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                className={`hover:text-blue-600 mr-2`}
                style={{ color: isDark ? '#a0aec0' : '#64748b' }}
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                className={`hover:text-red-600`}
                style={{ color: isDark ? '#a0aec0' : '#64748b' }}
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Status */}
      {project.status && (
        <span 
          className="inline-block px-2 py-1 mb-3 text-xs rounded"
          style={{ 
            backgroundColor: getStatusColors(project.status).bg,
            color: getStatusColors(project.status).color,
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
        style={{ color: textSecondary }}
      >
        {project.description}
      </p>
      
      {/* Project Dates */}
      <div className="mb-4">
        <div className="flex items-center mb-1 text-xs" style={{ color: textSecondary }}>
          <Calendar size={14} className="mr-2" />
          <span className="mr-1">Start:</span>
          <span className="font-medium" style={{ color: textPrimary }}>
            {formatDate(project.start_date)}
          </span>
        </div>
        
        <div className="flex items-center mb-1 text-xs" style={{ color: textSecondary }}>
          <Calendar size={14} className="mr-2" />
          <span className="mr-1">End:</span>
          <span className="font-medium" style={{ color: textPrimary }}>
            {formatDate(project.end_date)}
          </span>
        </div>
        
        <div className="flex items-center text-xs" style={{ color: textSecondary }}>
          <Clock size={14} className="mr-2" />
          <span className="mr-1">Posted:</span>
          <span className="font-medium" style={{ color: textPrimary }}>
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
          backgroundColor: buttonBg,
          color: buttonColor,
          border: `1px solid ${buttonBorder}`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = buttonBgHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = buttonBg;
        }}
      >
        View Project Details
      </button>
    </div>
  );
};

// Project grid component
const ProjectsGrid = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const bgColor = isDark ? '#121a24' : '#f8faff';

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


  const [arrayPermissions, setArrayPermissions] = useState({});
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
        setUserData(result);
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

  const filteredProjects = useMemo(() => 
    projects.filter(
      (project) =>
        project.title.toLowerCase().includes(search.toLowerCase()) &&
        (!filters.status || project.status === filters.status)
    ), 
    [projects, search, filters.status]
  );

  useEffect(() => {
    // Check permissions for all resources
    if (userData && filteredProjects.length > 0) {
      filteredProjects.forEach(async (project) => {
        const clubId = project.club_id?._id || project.club_id;
        const boardId = project.board_id?._id || project.board_id;
        
        // If you must use the async version of hasPermission
        const hasAccess = await hasPermission("projects", userData, boardId, clubId);
        
        setArrayPermissions(prev => ({
          ...prev,
          [project._id]: hasAccess
        }));
      });
    }
  }, [userData, filteredProjects]);

  useEffect(() => {
    console.log("llll");
  }, [userData]);
  
  
  useEffect(() => {
    console.log("llsjnjndjll");
  }, [filteredProjects]);

  return (
    <div 
      className="px-4 sm:px-20 py-15 min-h-screen"
      style={{ backgroundColor: bgColor }}
    >
      <SearchAndFilter
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6 px-4 sm:px-0">      
        {filteredProjects.map(project => (
          <ProjectCard 
            key={project._id} 
            project={project} 
            hasPermission={arrayPermissions}
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