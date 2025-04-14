"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchUserData } from "@/utils/auth";

// Icons
import { Search, Edit2, Trash2, Plus, Calendar, User } from "lucide-react";

export default function BLOGS({ boardId: propBoardId = null }) {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithBlogPermission, setUserClubsWithBlogPermission] = useState([]);
  const [userBoardsWithBlogPermission, setUserBoardsWithBlogPermission] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(propBoardId);

  const router = useRouter();

  // Fetch user data on mount
  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        // Extract clubs with blogs permission
        if (result.userData?.data?.clubs) {
          const clubsWithPermission = Object.keys(
            result.userData.data.clubs
          ).filter(
            (clubId) => result.userData.data.clubs[clubId].blogs === true
          );
          setUserClubsWithBlogPermission(clubsWithPermission);

          // Set the first club as default if available and no board_id prop
          if (clubsWithPermission.length > 0 && !propBoardId) {
            setSelectedClubId(clubsWithPermission[0]);
          }
        }

        // Extract boards with blogs permission
        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData.data.boards
          ).filter(
            (boardId) => result.userData.data.boards[boardId].blogs === true
          );
          setUserBoardsWithBlogPermission(boardsWithPermission);

          // Set the first board as default if available and no board_id prop
          if (boardsWithPermission.length > 0 && !propBoardId) {
            setSelectedBoardId(boardsWithPermission[0]);
          }
        }
      }
    }
    loadUserData();
  }, [propBoardId]);

  // Check if user has permission to edit/delete a blog
  const hasBlogPermission = (blog) => {
    // Superadmins have all permissions
    if (isSuperAdmin) return true;

    // Check if blog belongs to a club where user has permission
    if (blog.club_id) {
      const clubId = blog.club_id._id || blog.club_id;
      if (userClubsWithBlogPermission.includes(clubId)) {
        return true;
      }
    }

    // Check if blog belongs to a board where user has permission
    if (blog.board_id) {
      const boardId = blog.board_id._id || blog.board_id;
      if (userBoardsWithBlogPermission.includes(boardId)) {
        return true;
      }
    }

    return false;
  };

  // Check if user can create blogs
  const canCreateBlogs = () => {
    if (propBoardId) {
      if (userBoardsWithBlogPermission.includes(propBoardId)) {
        return true;
      }
      return isSuperAdmin;
    }
    return false;
  };

  // Fetch blogs from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        let url = "http://localhost:5000/blogs/blogs";

        // If a board_id prop is provided, fetch only blogs for that board
        if (propBoardId) {
          url += `?board_id=${propBoardId}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();

        const transformedBlogs = jsonResponse
          .map((blog) => ({
            id: blog._id,
            title: blog.title || "Untitled Blog",
            publisher: blog.publisher || "Unknown",
            introduction: blog.introduction || "",
            mainContent: blog.main_content || "",
            conclusion: blog.conclusion || "",
            tags: blog.tags || [],
            image: blog.image || null,
            club_id: blog.club_id || null,
            board_id: blog.board_id || null,
            createdAt: new Date(
              blog.createdAt || new Date()
            ).toLocaleDateString(),
          }))
          .filter((blog) => blog.title !== "Untitled Blog");

        setBlogs(transformedBlogs);
        setFilteredBlogs(transformedBlogs);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [propBoardId]);

  // Add filtering effect
  useEffect(() => {
    let filtered = [...blogs];

    // If board_id prop is provided, ensure we only show blogs for that board
    if (propBoardId) {
      filtered = filtered.filter((blog) => {
        const blogBoardId = blog.board_id?._id || blog.board_id;
        return blogBoardId === propBoardId;
      });
    }

    // Apply search filter if there's a query
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(lowercaseQuery) ||
          blog.introduction.toLowerCase().includes(lowercaseQuery) ||
          (blog.tags &&
            blog.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)))
      );
    }

    setFilteredBlogs(filtered);
  }, [searchQuery, blogs, propBoardId]);

  const handleDelete = async (blogId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `http://localhost:5000/blogs/blogs/${blogId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedBlogs = blogs.filter((blog) => blog.id !== blogId);
      setBlogs(updatedBlogs);
      setFilteredBlogs(updatedBlogs);
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }
  };

  const handleEdit = async (blog, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `http://localhost:5000/blogs/blogs/${blog.id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blogDetails = await response.json();

      const formData = {
        title: blogDetails.title,
        publisher: blogDetails.publisher || "Unknown",
        introduction: blogDetails.introduction,
        mainContent: blogDetails.main_content,
        conclusion: blogDetails.conclusion,
        tags: blogDetails.tags || [],
        blogImage: blogDetails.image || null,
        club_id: blogDetails.club_id || null,
        board_id: blogDetails.board_id || null,
      };

      setSelectedBlog({
        ...blog,
        ...formData,
      });
      setIsEditing(true);
      setOpenDialog(true);
    } catch (error) {
      console.error("Failed to fetch blog details:", error);
    }
  };

  const handleAddNew = () => {
    setSelectedBlog(null);
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = isEditing
        ? `http://localhost:5000/blogs/blogs/${selectedBlog.id}`
        : "http://localhost:5000/blogs/blogs";

      const method = isEditing ? "PUT" : "POST";

      const multipartFormData = new FormData();

      // Append all text fields
      multipartFormData.append("title", formData.title);
      multipartFormData.append("publisher", formData.publisher);
      multipartFormData.append("introduction", formData.introduction);
      multipartFormData.append("mainContent", formData.mainContent);
      multipartFormData.append("conclusion", formData.conclusion);

      // Append tags
      formData.tags.forEach((tag, index) => {
        multipartFormData.append(`tags[${index}]`, tag);
      });

      // Handle image upload
      if (formData.blogImage instanceof File) {
        multipartFormData.append("image", formData.blogImage);
      } else if (formData.blogImage && typeof formData.blogImage === "string") {
        multipartFormData.append("image", formData.blogImage);
      }

      // Append ID for editing
      if (isEditing && selectedBlog) {
        multipartFormData.append("_id", selectedBlog.id);
      }

      // Append club_id and board_id if available
      if (formData.club_id) {
        multipartFormData.append("club_id", formData.club_id);
      }
      if (formData.board_id) {
        multipartFormData.append("board_id", formData.board_id);
      } else if (propBoardId) {
        // If we're in board-specific view, automatically assign to this board
        multipartFormData.append("board_id", propBoardId);
      }

      const response = await fetch(url, {
        method: method,
        body: multipartFormData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedBlog = await response.json();

      if (isEditing && selectedBlog) {
        const updatedBlogs = blogs.map((blog) =>
          blog.id === selectedBlog.id
            ? {
                ...updatedBlog,
                id: updatedBlog._id,
                createdAt: new Date(updatedBlog.createdAt).toLocaleDateString(),
              }
            : blog
        );
        setBlogs(updatedBlogs);
        setFilteredBlogs(updatedBlogs);
      } else {
        const newBlog = {
          ...updatedBlog,
          id: updatedBlog._id,
          createdAt: new Date(updatedBlog.createdAt).toLocaleDateString(),
        };
        const updatedBlogs = [...blogs, newBlog];
        setBlogs(updatedBlogs);
        setFilteredBlogs(updatedBlogs);
      }
      setOpenDialog(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to submit blog:", error);
    }
  };

  const navigateToBlog = (blogId) => {
    router.push(`/current_blog/${blogId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8faff]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#4776E6] border-r-[#6a98ff] border-b-[#8E54E9] border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[#2A3B4F]">Loading blogs...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8faff]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 flex items-center justify-center rounded-full mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-[#2A3B4F] mb-2">Error Loading Blogs</h2>
          <p className="text-[#607080]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4776E6] to-[#8E54E9] py-6 px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-semibold text-white">
            {propBoardId ? "Board Blogs" : "All Blogs"}
          </h1>
          <p className="text-white/80 mt-1">
            {filteredBlogs.length} {filteredBlogs.length === 1 ? "article" : "articles"} available
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-6 sticky top-24">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white py-3 px-4 pl-10 rounded-lg shadow-sm border border-[#e0e7ff] focus:outline-none focus:ring-2 focus:ring-[#4776E6]/30 focus:border-[#4776E6] transition-all duration-300"
                />
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#607080]" />
              </div>
              
              {filteredBlogs.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm uppercase text-[#607080] font-medium tracking-wider mb-3">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(filteredBlogs.flatMap(blog => blog.tags))).slice(0, 8).map((tag, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSearchQuery(tag)}
                        className="text-xs px-3 py-1 rounded-md bg-[rgba(95,150,230,0.1)] text-[#4776E6] hover:bg-[rgba(95,150,230,0.2)] transition-all duration-300"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            {filteredBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <div 
                    key={blog.id}
                    onClick={() => navigateToBlog(blog.id)}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg border-t-4 border-[#4776E6] transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
                  >
                    {blog.image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={`http://localhost:5000/uploads/${blog.image.filename}`}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {blog.tags.slice(0, 3).map((tag, index) => {
                            // Rotate between several colors for visual variety
                            const colors = [
                              "bg-blue-100 text-blue-700", 
                              "bg-green-100 text-green-700",
                              "bg-purple-100 text-purple-700", 
                              "bg-amber-100 text-amber-700",
                              "bg-pink-100 text-pink-700"
                            ];
                            const colorClass = colors[index % colors.length];
                            
                            return (
                              <span 
                                key={index}
                                className={`text-xs px-2 py-0.5 rounded ${colorClass}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSearchQuery(tag);
                                }}
                              >
                                {tag}
                              </span>
                            );
                          })}
                          {blog.tags.length > 3 && (
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                              +{blog.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <h3 className="text-lg font-semibold text-[#2A3B4F] mb-2 line-clamp-2">{blog.title}</h3>
                      
                      <p className="text-[#607080] text-sm mb-4 line-clamp-2">
                        {blog.introduction}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-xs text-[#607080]">
                          <User className="h-3 w-3 mr-1" />
                          <span>{blog.publisher}</span>
                          <span className="mx-2">•</span>
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{blog.createdAt}</span>
                        </div>
                        
                        {hasBlogPermission(blog) && (
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => handleEdit(blog, e)}
                              className="p-1.5 rounded-md text-[#4776E6] hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(blog.id, e)}
                              className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-[#f8faff] rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-[#607080]/50" />
                </div>
                <h3 className="text-xl font-semibold text-[#2A3B4F] mb-2">
                  No blogs found{propBoardId ? " for this board" : ""}
                </h3>
                {searchQuery && (
                  <p className="text-[#607080]">
                    No results for "{searchQuery}". Try a different search term.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      {canCreateBlogs() && (
        <button
          onClick={handleAddNew}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-[#4776E6] to-[#8E54E9] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          style={{ boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)" }}
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* The form component would go here - keeping the logic but it would need to be restyled */}
      {openDialog && (
        <BlogCreateForm
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setIsEditing(false);
          }}
          onSubmit={handleFormSubmit}
          initialData={
            selectedBlog
              ? {
                  title: selectedBlog.title,
                  publisher: selectedBlog.publisher,
                  introduction: selectedBlog.introduction,
                  mainContent: selectedBlog.mainContent,
                  conclusion: selectedBlog.conclusion,
                  tags: selectedBlog.tags,
                  image: selectedBlog.image,
                }
              : null
          }
          club_id={selectedClubId}
          board_id={propBoardId} 
        />
      )}
    </div>
  );
}

