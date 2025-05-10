"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CardMedia,
  CircularProgress,
  Container,
  Paper,
  alpha,
  styled,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { fetchUserData, getAuthToken } from "@/utils/auth";

// Styled components for the premium UI (reused from ForumList)
const GradientText = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 600,
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
  color: "white",
  fontWeight: 500,
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
  padding: "8px 24px",
  textTransform: "none",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(90deg, #3a5fc0 0%, #7b3dc1 100%)",
    boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
    transform: "translateY(-2px)",
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  color: "#4776E6",
  borderColor: "#4776E6",
  borderRadius: "8px",
  padding: "8px 24px",
  textTransform: "none",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: alpha("#4776E6", 0.08),
    borderColor: "#3a5fc0",
    transform: "translateY(-2px)",
  },
}));

const PremiumChip = styled(Chip)(({ theme }) => ({
  height: 22,
  fontSize: "0.65rem",
  backgroundColor: alpha("#4776E6", 0.1),
  color: "#4776E6",
  "& .MuiChip-label": {
    padding: "0 8px",
  },
}));

const ForumJoinPage = () => {
  const router = useRouter();
  const params = useParams();
  const forumId = params.forumId;
  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [userId, setUserId] = useState(null);
  const [boardName, setBoardName] = useState("");
  const [clubName, setClubName] = useState("");
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!authToken) {
          return;
        }

        // Fetch user data
        const userData = await fetchUserData();
        if (!userData || !userData.userId) {
          setError("Please login to join forums");
          setLoading(false);
          return;
        }
        setUserId(userData.userId);

        // Fetch forum data
        const forumResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums/${forumId}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            }
          }
        );

        if (!forumResponse.ok) {
          throw new Error("Failed to fetch forum");
        }

        const forumData = await forumResponse.json();
        setForum(forumData.data);

        // Check if user is already a member
        const membershipResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums/${forumId}/membership/${userData.userId}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            }
          }
        );

        // Fixed this part to properly handle the membership check
        if (membershipResponse.ok) {
          const membershipData = await membershipResponse.json();
          
          // Log the response to debug
          console.log("Membership data:", membershipData);
          
          // Check if user is already a member - this should match your API response structure
          if (membershipData.isMember === true) {
            console.log("User is already a member, redirecting...");
            // User is already a member, redirect to forum page
            router.push(`/current_forum/${forumId}`);
            return;
          }
        }

        // Fetch board name if applicable
        if (forumData.data.board_id) {
          const boardResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/boards/${forumData.data.board_id}`,
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
              }
            }
          );
          if (boardResponse.ok) {
            const boardData = await boardResponse.json();
            setBoardName(boardData.name);
          }
        }

        // Fetch club name if applicable
        if (forumData.data.club_id) {
          const clubResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/${forumData.data.club_id}`,
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
              }
            }
          );
          if (clubResponse.ok) {
            const clubData = await clubResponse.json();
            setClubName(clubData.name);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Could not load forum information");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [forumId, router, authToken]);

  const handleJoinForum = async () => {
    if (!userId) {
      setError("Please login to join forums");
      return;
    }

    if (!authToken) {
      return;
    }

    setJoining(true);
    try {
      const currentDate = new Date().toISOString();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums/${forumId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            user_id: userId,
            forum_id: forumId,
            joined_at: currentDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to join forum");
      }

      // Successfully joined, redirect to forum page
      router.push(`/current_forum/${forumId}`);
    } catch (error) {
      console.error("Error joining forum:", error);
      setError("Failed to join forum. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const handleBack = () => {
    router.push("/forums");
  };

  const tagColors = [
    "#2196F3",
    "#4CAF50",
    "#FF9800",
    "#9C27B0",
    "#F44336",
    "#00BCD4",
    "#673AB7",
    "#3F51B5",
  ];

  const getTagColor = (index) => {
    return tagColors[index % tagColors.length];
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          backgroundColor: "#f8faff",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 8, backgroundColor: "#f8faff", minHeight: "100vh" }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(95, 150, 230, 0.1)",
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <SecondaryButton
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Forums
          </SecondaryButton>
        </Paper>
      </Container>
    );
  }

  if (!forum) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 8, backgroundColor: "#f8faff", minHeight: "100vh" }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(95, 150, 230, 0.1)",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Forum not found
          </Typography>
          <SecondaryButton
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Forums
          </SecondaryButton>
        </Paper>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{ py: 8, backgroundColor: "#f8faff", minHeight: "100vh" }}
    >
      <Box sx={{ mb: 4 }}>
        <SecondaryButton startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Forums
        </SecondaryButton>
      </Box>

      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(95, 150, 230, 0.15)",
          overflow: "hidden",
          borderTop: "4px solid #4776E6",
        }}
      >
        {forum.image && (
          <CardMedia
            component="img"
            height="300"
            image={`${process.env.NEXT_PUBLIC_BACKEND_URL}/Uploads/${forum.image.filename}`}
            alt={forum.title}
          />
        )}

        <CardContent sx={{ p: 4 }}>
          <GradientText variant="h4" gutterBottom>
            {forum.title}
          </GradientText>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 2 }}>
            {boardName && (
              <PremiumChip
                label={boardName}
                size="small"
                sx={{
                  backgroundColor: alpha("#4CAF50", 0.1),
                  color: "#4CAF50",
                }}
              />
            )}
            {clubName && (
              <PremiumChip
                label={clubName}
                size="small"
                sx={{
                  backgroundColor: alpha("#FF5722", 0.1),
                  color: "#FF5722",
                }}
              />
            )}
            {forum.tags &&
              forum.tags.map((tag, index) => (
                <PremiumChip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    backgroundColor: alpha(getTagColor(index), 0.1),
                    color: getTagColor(index),
                  }}
                />
              ))}
          </Box>

          <Typography variant="body1" sx={{ color: "#607080", mb: 4 }}>
            {forum.description}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #eee",
              pt: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: "#607080" }}>
              To participate in discussions, you need to join this forum.
            </Typography>

            <PrimaryButton
              startIcon={<PersonAddIcon />}
              onClick={handleJoinForum}
              disabled={joining}
            >
              {joining ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Join Forum"
              )}
            </PrimaryButton>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ForumJoinPage;
