import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  Card,
  Avatar,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const ClubsList = ({ boardId, userId, searchQuery = "" }) => {
  console.log({ boardId, userId, searchQuery });

  const router = useRouter();
  const theme = useTheme();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleClick = (value) => {
    router.push(value);
  };

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);

        const clubsUrl = userId
          ? `http://localhost:5000/clubs/clubs/board/${boardId}?user_id=${userId}`
          : `http://localhost:5000/clubs/clubs/board/${boardId}`;

        const clubsResponse = await fetch(clubsUrl);
        if (!clubsResponse.ok) throw new Error("Failed to fetch clubs");
        const clubsData = await clubsResponse.json();
        setClubs(clubsData);
        console.log(clubsData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching clubs:", error);
        setError("Failed to load clubs. Please try again later.");
        setLoading(false);
      }
    };

    if (boardId) {
      fetchClubs();
    }
  }, [boardId, userId]);

  const handleFollowClub = async (clubId, e) => {
    e.stopPropagation(); // Prevent event bubbling to the card click
    try {
      if (!userId) return;

      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/follow/club/${clubId}`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error("Failed to follow club");

      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club._id === clubId ? { ...club, isFollowing: true } : club
        )
      );
    } catch (error) {
      console.error("Error following club:", error);
      throw error;
    }
  };

  const handleUnfollowClub = async (clubId, e) => {
    e.stopPropagation(); // Prevent event bubbling to the card click
    try {
      if (!userId) return;

      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/unfollow/club/${clubId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to unfollow club");

      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club._id === clubId ? { ...club, isFollowing: false } : club
        )
      );
    } catch (error) {
      console.error("Error unfollowing club:", error);
      throw error;
    }
  };


  // Filter clubs based on searchQuery
  const filteredClubs = clubs.filter((club) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      club.name.toLowerCase().includes(query) ||
      (club.description && club.description.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      {clubs.length === 0 ? (
        <Alert severity="info">
          No clubs found in this board. Clubs may be added by administrators.
        </Alert>
      ) : filteredClubs.length === 0 ? (
        <Alert severity="info">
          No clubs match your search. Try a different search term.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredClubs.map((club) => (
            <Grid item xs={12} sm={6} md={4} key={club._id}>
              <Card
                sx={{
                  p: 2,
                  height: "100%",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
                onClick={() => handleClick(`/current_club/${club._id}`)}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    src={
                      club.image?.filename
                        ? `http://localhost:5000/uploads/${club.image.filename}`
                        : undefined
                    }
                    sx={{ mr: 2, bgcolor: "#1976d2", cursor: "pointer" }}
                  >
                    {club.name?.charAt(0)?.toUpperCase()}
                  </Avatar>

                  <Typography variant="h6" noWrap>
                    {club.name}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    height: "4.5em",
                  }}
                >
                  {club.description || "No description available."}
                </Typography>

                {userId && (
                  <Button
                    variant={club.isFollowing ? "contained" : "outlined"}
                    fullWidth
                    color="primary"
                    onClick={(e) =>
                      club.isFollowing
                        ? handleUnfollowClub(club._id, e)
                        : handleFollowClub(club._id, e)
                    }
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      mt: "auto",
                      borderColor: "#1976d2",
                      color: club.isFollowing ? "#fff" : "#1976d2",
                      backgroundColor: club.isFollowing
                        ? "#1976d2"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: club.isFollowing
                          ? "#1565c0"
                          : "transparent",
                        borderColor: "#1976d2",
                        opacity: 0.8,
                      },
                    }}
                  >
                    {club.isFollowing ? "Unfollow Club" : "Follow Club"}
                  </Button>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ClubsList;
