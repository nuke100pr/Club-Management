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
  Container,
  useTheme
} from "@mui/material";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchAndFilter from "../../components/clubs/SearchAndFilter";
import CreateClubForm from "../../components/clubs/CreateClubForm";
import { fetchUserData, getAuthToken } from "@/utils/auth";

const ClubCard = ({ club, boardName, onFollow, onUnfollow, onEdit, onDelete, hasPermission }) => {
  const theme = useTheme();
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
        boxShadow: theme.shadows[2], 
        borderRadius: 2,
        cursor: "pointer",
        backgroundColor: theme.palette.background.paper,
        "&:hover": {
          boxShadow: theme.shadows[4],
          transform: "translateY(-2px)",
          transition: "all 0.2s ease-in-out"
        }
      }}
      onClick={handleCardClick}
    >
      <Box p={2}>
        <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" color="text.primary">
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

        <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
          <Typography component="div" sx={{ display: 'flex', mb: 1 }}>
            <Typography component="span" fontWeight="bold" sx={{ mr: 1 }} color="text.primary">Owner:</Typography>
            <Typography component="span" color="text.secondary">{club.name}</Typography>
          </Typography>
          
          <Typography component="div" sx={{ display: 'flex', mb: 2 }}>
            <Typography component="span" fontWeight="bold" sx={{ mr: 1 }} color="text.primary">Description:</Typography>
            <Typography component="span" sx={{ maxHeight: "60px", overflow: "hidden" }} color="text.secondary">
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
          }}
        >
          {isFollowing ? "UNFOLLOW" : "FOLLOW"}
        </Button>
      </Box>
    </Card>
  );
};

const BoardHeader = ({ boardId, boardName, isFollowing, onFollow, onUnfollow }) => {
  const theme = useTheme();
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
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', 
        p: 1.5, 
        borderRadius: "4px 4px 0 0",
        borderBottom: `1px solid ${theme.palette.divider}`,
        mb: 2,
        cursor: "pointer",
        "&:hover": {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        }
      }}
      onClick={handleBoardClick}
    >
      <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
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
  const theme = useTheme();
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
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        if (result.userData?.clubs) {
          const clubsWithPermission = Object.keys(result.userData.clubs).filter(
            (clubId) => result.userData.clubs[clubId].admin === true
          );
          setUserClubsWithPermission(clubsWithPermission);
        }
      }
    }
    loadUserData();

    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }
    fetchAuthToken();
  }, []);

  const hasPermission = (club) => {
    if (isSuperAdmin) return true;
    const hasClubPermission = club._id && userClubsWithPermission.includes(club._id);
    return hasClubPermission;
  };

  useEffect(() => {
    const fetchClubsAndBoards = async () => {
      try {
        if (!authToken) return;

        const clubsUrl = userId 
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/clubs?user_id=${userId}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/clubs`;
        
        const clubsResponse = await fetch(clubsUrl, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        });
        if (!clubsResponse.ok) throw new Error('Failed to fetch clubs');
        const clubsData = await clubsResponse.json();
        setClubs(clubsData);

        const boardsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/boards`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        });
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
  }, [userId, authToken]);

  const handleEdit = async (club) => {
    try {
      if (!authToken) return;

      const url = userId 
        ? `http://localhost:5000/clubs/clubs/${club._id}?user_id=${userId}`
        : `http://localhost:5000/clubs/clubs/${club._id}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
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
      if (!authToken) return;

      const response = await fetch(`http://localhost:5000/clubs/clubs/${clubId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
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
      if (!authToken || !userId) return;
      
      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/follow/club/${clubId}`,
        { 
          method: "POST",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
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
      if (!authToken || !userId) return;
      
      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/unfollow/club/${clubId}`,
        { 
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
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
      if (!authToken || !userId) return;
      
      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/follow/board/${boardId}`,
        { 
          method: "POST",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
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
      if (!authToken || !userId) return;
      
      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/unfollow/board/${boardId}`,
        { 
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
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
    <div style={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Box sx={{ pt: 4 }}>  
        <Container maxWidth="xl">
          <SearchAndFilter 
            onSearchChange={setSearch}
            onBoardFilterChange={setSelectedBoard}
            availableBoards={boards}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
          />
          
          {!hasResults && (
            <Alert severity="info" sx={{ mt: 2 }}>
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
          
          {(isSuperAdmin || userClubsWithPermission.length > 0) && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                position: "fixed",
                bottom: 24,
                right: 24,
                background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
                }
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
        </Container>
      </Box>
    </div>
  );
};

export default ClubList;
