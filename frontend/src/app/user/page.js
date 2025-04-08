"use client";
import { Avatar, Box, Card, CardContent, Typography, Chip, Grid, Container } from "@mui/material";

const user = {
  name: "John Doe",
  status: "Active",
  email: "johndoe@example.com",
  clubs: ["Coding Club", "Robotics Club", "AI Society"],
  badges: ["Top Contributor", "Mentor", "Hackathon Winner"],
  image: "https://via.placeholder.com/150",
};

export default function ProfilePage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card sx={{ p: 3, textAlign: "center", boxShadow: 3 }}>
        <Avatar src={user.image} sx={{ width: 120, height: 120, mx: "auto", mb: 2 }} />
        <Typography variant="h4" fontWeight={600}>{user.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary">{user.status}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>{user.email}</Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={500}>Clubs</Typography>
          <Grid container spacing={1} justifyContent="center" sx={{ mt: 1 }}>
            {user.clubs.map((club, index) => (
              <Grid item key={index}>
                <Chip label={club} color="primary" variant="outlined" />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={500}>Badges</Typography>
          <Grid container spacing={1} justifyContent="center" sx={{ mt: 1 }}>
            {user.badges.map((badge, index) => (
              <Grid item key={index}>
                <Chip label={badge} color="secondary" />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Card>
    </Container>
  );
}