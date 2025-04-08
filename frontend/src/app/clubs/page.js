"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  IconButton,
  Box,
  Fab,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchAndFilter from "../../components/clubs/SearchAndFilter";
import CreateClubForm from "../../components/clubs/CreateClubForm";
import Navbar from "../../components/Navbar";
import { fetchUserData } from "@/utils/auth";

const ClubCard = ({ club, boardName, onFollow, onUnfollow, onEdit, onDelete, hasPermission }) => {
  const [isFollowing, setIsFollowing] = useState(club.isFollowing || false);
  const router = useRouter();
  
  const handleFollowClick = async (e) => {
    e.stopPropagation();
    try {
      if (isFollowing) {
        await onUnfollow(club._id);
        setIsFollowing(false);
      } else {
        await onFollow(club._id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  const handleCardClick = () => {
    router.push(`/current_club/${club._id}`);
  };

  const handleEditClick = (e, club) => {
    e.stopPropagation();
    onEdit(club);
  };

  const handleDeleteClick = (e, clubId) => {
    e.stopPropagation();
    onDelete(clubId);
  };

  const getTagColor = (boardId) => {
    return boardId === "b1" ? "#4CAF50" : "#FF5722";
  };

  return (
    <Card 
      sx={{ 
        width: 350, 
        m: 1, 
        boxShadow: "0px 2px 6px rgba(0,0,0,0.1)", 
        borderRadius: 2,
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)",
          transition: "all 0.2s ease-in-out"
        }
      }}
      onClick={handleCardClick}
    >
      <Box p={2}>
        <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">
            {club.name}
          </Typography>
          {hasPermission && (
            <Box>
              <IconButton onClick={(e) => handleEditClick(e, club)} color="primary">
                <EditIcon />
              </IconButton>
              <IconButton onClick={(e) => handleDeleteClick(e, club._id)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        
        <Button 
          variant="contained" 
          disableElevation
          sx={{ 
            borderRadius: 20, 
            backgroundColor: getTagColor(club.board_id),
            textTransform: "none",
            mb: 2,
            px: 2,
            py: 0.5,
            "&:hover": {
              backgroundColor: getTagColor(club.board_id),
            }
          }}
        >
          {boardName}
        </Button>

        <Box sx={{ borderTop: '1px solid #eee', pt: 2 }}>
          <Typography component="div" sx={{ display: 'flex', mb: 1 }}>
            <Typography component="span" fontWeight="bold" sx={{ mr: 1 }}>Owner:</Typography>
            <Typography component="span">{club.name}</Typography>
          </Typography>
          
          <Typography component="div" sx={{ display: 'flex', mb: 2 }}>
            <Typography component="span" fontWeight="bold" sx={{ mr: 1 }}>Description:</Typography>
            <Typography component="span" sx={{ maxHeight: "60px", overflow: "hidden" }}>
              {club.description}
            </Typography>
          </Typography>
        </Box>

        <Button 
          variant={isFollowing ? "contained" : "outlined"}
          fullWidth
          color="primary" 
          onClick={handleFollowClick}
          sx={{ 
            borderRadius: 2, 
            textTransform: "none",
            py: 1.5,
            borderColor: "#1976d2",
            color: isFollowing ? "#fff" : "#1976d2",
            backgroundColor: isFollowing ? "#1976d2" : "transparent",
            "&:hover": {
              backgroundColor: isFollowing ? "#1565c0" : "transparent",
              borderColor: "#1976d2",
              opacity: 0.8,
            }
          }}
        >
          {isFollowing ? "UNFOLLOW" : "FOLLOW"}
        </Button>
      </Box>
    </Card>
  );
};

const BoardHeader = ({ boardId, boardName, isFollowing, onFollow, onUnfollow }) => {
  const [following, setFollowing] = useState(isFollowing);
  const router = useRouter();

  useEffect(() => {
    setFollowing(isFollowing);
  }, [isFollowing]);

  const handleFollowClick = async (e) => {
    e.stopPropagation();
    try {
      if (following) {
        await onUnfollow(boardId);
        setFollowing(false);
      } else {
        await onFollow(boardId);
        setFollowing(true);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  const handleBoardClick = () => {
    router.push(`/current_board/${boardId}`);
  };

  return (
    <Box 
      sx={{ 
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f5f5f5", 
        p: 1.5, 
        borderRadius: "4px 4px 0 0",
        borderBottom: "1px solid #e0e0e0",
        mb: 2,
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#eeeeee",
        }
      }}
      onClick={handleBoardClick}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        {boardName}
      </Typography>
      
      <Button
        variant={following ? "contained" : "outlined"}
        size="small"
        onClick={handleFollowClick}
        sx={{
          borderRadius: 20,
          textTransform: "none",
          px: 2,
          py: 0.5,
          fontSize: "0.75rem"
        }}
      >
        {following ? "Following" : "Follow Board"}
      </Button>
    </Box>
  );
};

const ClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [boards, setBoards] = useState({});
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithPermission, setUserClubsWithPermission] = useState([]);

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        // Extract clubs with admin permission
        if (result.userData?.clubs) {
          const clubsWithPermission = Object.keys(result.userData.clubs).filter(
            (clubId) => result.userData.clubs[clubId].admin === true
          );
          setUserClubsWithPermission(clubsWithPermission);
        }
      }
    }
    loadUserData();
  }, []);

  const hasPermission = (club) => {
    // Superadmins have all permissions
    if (isSuperAdmin) return true;

    // Check if user has admin permission for this club
    const hasClubPermission = club._id && userClubsWithPermission.includes(club._id);

    return hasClubPermission;
  };

  useEffect(() => {
    const fetchClubsAndBoards = async () => {
      try {
        // Fetch clubs with follow status for current user
        const clubsUrl = userId 
          ? `http://localhost:5000/clubs/clubs?user_id=${userId}`
          : 'http://localhost:5000/clubs/clubs';
        
        const clubsResponse = await fetch(clubsUrl);
        if (!clubsResponse.ok) throw new Error('Failed to fetch clubs');
        const clubsData = await clubsResponse.json();
        setClubs(clubsData);

        // Fetch boards
        const boardsResponse = await fetch('http://localhost:5000/boards');
        if (!boardsResponse.ok) throw new Error('Failed to fetch boards');
        const boardsData = await boardsResponse.json();
        
        const boardsObject = boardsData.reduce((acc, board) => {
          acc[board._id] = board.name;
          return acc;
        }, {});
        setBoards(boardsObject);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchClubsAndBoards();
  }, [userId]);

  const handleEdit = async (club) => {
    try {
      const url = userId 
        ? `http://localhost:5000/clubs/clubs/${club._id}?user_id=${userId}`
        : `http://localhost:5000/clubs/clubs/${club._id}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch club details');
      const clubDetails = await response.json();
      setSelectedClub(clubDetails);
      setEditDialogOpen(true);
    } catch (error) {
      console.error('Error fetching club details:', error);
    }
  };

  const handleDelete = async (clubId) => {
    try {
      const response = await fetch(`http://localhost:5000/clubs/clubs/${clubId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete club');
      
      setClubs(prevClubs => prevClubs.filter(club => club._id !== clubId));
    } catch (error) {
      console.error('Error deleting club:', error);
    }
  };
  
  const handleCreateClub = async (newClub) => {
    setClubs(prevClubs => [...prevClubs, newClub]);
    setCreateDialogOpen(false);
  };

  const handleUpdateClub = async (updatedClub) => {
    setClubs(prevClubs => 
      prevClubs.map(club => 
        club._id === updatedClub._id ? updatedClub : club
      )
    );
    setEditDialogOpen(false);
  };

  const handleFollowClub = async (clubId) => {
    try {
      if (!userId) return;
      
      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/follow/club/${clubId}`,
        { method: "POST" }
      );
      
      if (!response.ok) throw new Error('Failed to follow club');
      
      const updatedClub = await response.json();
      
      setClubs(prevClubs => 
        prevClubs.map(club => 
          club._id === clubId 
            ? { ...club, isFollowing: true } 
            : club
        )
      );
      
      return updatedClub;
    } catch (error) {
      console.error('Error following club:', error);
      throw error;
    }
  };

  const handleUnfollowClub = async (clubId) => {
    try {
      if (!userId) return;
      
      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/unfollow/club/${clubId}`,
        { method: "DELETE" }
      );
      
      if (!response.ok) throw new Error('Failed to unfollow club');
      
      setClubs(prevClubs => 
        prevClubs.map(club => 
          club._id === clubId 
            ? { ...club, isFollowing: false } 
            : club
        )
      );
    } catch (error) {
      console.error('Error unfollowing club:', error);
      throw error;
    }
  };

  const handleFollowBoard = async (boardId) => {
    try {
      if (!userId) return;
      
      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/follow/board/${boardId}`,
        { method: "POST" }
      );
      
      if (!response.ok) throw new Error('Failed to follow board');
      
      const updatedFollow = await response.json();
      
      setClubs(prevClubs => 
        prevClubs.map(club => 
          club.board_id === boardId 
            ? { ...club, isBoardFollowing: true } 
            : club
        )
      );
      
      return updatedFollow;
    } catch (error) {
      console.error('Error following board:', error);
      throw error;
    }
  };

  const handleUnfollowBoard = async (boardId) => {
    try {
      if (!userId) return;
      
      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/unfollow/board/${boardId}`,
        { method: "DELETE" }
      );
      
      if (!response.ok) throw new Error('Failed to unfollow board');
      
      setClubs(prevClubs => 
        prevClubs.map(club => 
          club.board_id === boardId 
            ? { ...club, isBoardFollowing: false } 
            : club
        )
      );
    } catch (error) {
      console.error('Error unfollowing board:', error);
      throw error;
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleBoardFilterChange = (boardId) => {
    setSelectedBoard(boardId);
  };

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
  };

  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      const matchesSearch = club.name.toLowerCase().includes(search.toLowerCase());
      const matchesBoard = !selectedBoard || club.board_id === selectedBoard;
      
      let matchesFilterType = true;
      if (filterType === "myClubs") {
        matchesFilterType = club.isFollowing === true;
      } else if (filterType === "myBoards") {
        matchesFilterType = club.isBoardFollowing === true;
      }
      
      return matchesSearch && matchesBoard && matchesFilterType;
    });
  }, [clubs, search, selectedBoard, filterType]);
  
  const groupedClubs = useMemo(() => {
    return filteredClubs.reduce((acc, club) => {
      const boardId = club.board_id;
      const boardName = boards[boardId] || "Unknown Board";
      
      if (!acc[boardName]) {
        acc[boardName] = {
          boardId: boardId,
          clubs: []
        };
      }
      
      acc[boardName].clubs.push(club);
      return acc;
    }, {});
  }, [filteredClubs, boards]);
  
  const sortedBoardNames = Object.keys(groupedClubs).sort();
  const hasResults = sortedBoardNames.length > 0;

  return (
    <div>

      <Box sx={{ position: "relative", pb: 10 }}>
        <SearchAndFilter 
          onSearchChange={handleSearchChange}
          onBoardFilterChange={handleBoardFilterChange}
          availableBoards={boards}
          filterType={filterType}
          onFilterTypeChange={handleFilterTypeChange}
        />
        
        {!hasResults && (
          <Alert severity="info" sx={{ mt: 2, mx: 2 }}>
            No clubs match your current filters. Try adjusting your filters or search term.
          </Alert>
        )}
        
        {sortedBoardNames.map((boardName) => {
          const boardData = groupedClubs[boardName];
          const boardId = boardData.boardId;
          const boardClubs = boardData.clubs;
          const isBoardFollowing = boardClubs[0]?.isBoardFollowing || false;
          
          return (
            <Box key={boardName} sx={{ mb: 4 }}>
              <BoardHeader 
                boardId={boardId} 
                boardName={boardName}
                isFollowing={isBoardFollowing}
                onFollow={handleFollowBoard}
                onUnfollow={handleUnfollowBoard}
              />
              
              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {boardClubs.map((club) => (
                  <ClubCard 
                    key={club._id}
                    club={club} 
                    boardName={boardName} 
                    onFollow={handleFollowClub}
                    onUnfollow={handleUnfollowClub}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    hasPermission={hasPermission(club)}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
        
        {(false) && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)"
            }}
          >
            <AddIcon />
          </Fab>
        )}
        
        <CreateClubForm
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          boards={boards}
          onSave={handleCreateClub}
        />

        {selectedClub && (
          <CreateClubForm
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            boards={boards}
            onSave={handleUpdateClub}
            initialData={selectedClub}
            isEditMode={true}
          />
        )}
      </Box>
    </div>
  );
};

export default ClubList;