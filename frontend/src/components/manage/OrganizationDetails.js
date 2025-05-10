"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Link,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Language as LanguageIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { getAuthToken } from "@/utils/auth";

const OrganizationDetails = ({ organization, organizationType, onUpdate }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    description: "",
    established_year: "",
    image: null,
    social_media: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      website: "",
    },
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  const handleOpenDialog = () => {
    setNewOrgData({
      name: organization.name,
      description: organization.description,
      established_year: organization.established_year || "",
      image: null,
      social_media: {
        facebook: organization.social_media?.facebook || "",
        instagram: organization.social_media?.instagram || "",
        twitter: organization.social_media?.twitter || "",
        linkedin: organization.social_media?.linkedin || "",
        youtube: organization.social_media?.youtube || "",
        website: organization.social_media?.website || "",
      },
    });
    setImagePreview(organization.image);
    setOpenDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrgData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setNewOrgData((prev) => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [name]: value,
      },
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewOrgData((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!authToken) {
      return;
    }
    
    try {
      await onUpdate(newOrgData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating organization:", error);
    }
  };

  return (
    <>
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <Box
          sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
        >
          {organization.image && (
            <CardMedia
              component="img"
              sx={{
                width: { xs: "100%", md: 300 },
                height: { xs: 200, md: "auto" },
                objectFit: "cover",
              }}
              image={`http://localhost:5000/uploads/${organization.image.filename}`}
              alt={`${organization.name} image`}
            />
          )}
          <Box sx={{ flex: 1 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h4" component="h1" gutterBottom>
                  {organization.name}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={handleOpenDialog}
                  sx={{ ml: 2 }}
                >
                  Edit Details
                </Button>
              </Box>

              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                <DescriptionIcon
                  color="primary"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                {organization.description}
              </Typography>

              {organization.established_year && (
                <Typography variant="body1" paragraph>
                  <CalendarIcon
                    color="primary"
                    sx={{ verticalAlign: "middle", mr: 1 }}
                  />
                  Established: {organization.established_year}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Social Media Links
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {organization.social_media?.facebook && (
                  <Link
                    href={organization.social_media.facebook}
                    target="_blank"
                    rel="noopener"
                  >
                    <Button variant="outlined" startIcon={<FacebookIcon />}>
                      Facebook
                    </Button>
                  </Link>
                )}
                {organization.social_media?.instagram && (
                  <Link
                    href={organization.social_media.instagram}
                    target="_blank"
                    rel="noopener"
                  >
                    <Button variant="outlined" startIcon={<InstagramIcon />}>
                      Instagram
                    </Button>
                  </Link>
                )}
                {organization.social_media?.twitter && (
                  <Link
                    href={organization.social_media.twitter}
                    target="_blank"
                    rel="noopener"
                  >
                    <Button variant="outlined" startIcon={<TwitterIcon />}>
                      Twitter
                    </Button>
                  </Link>
                )}
                {organization.social_media?.linkedin && (
                  <Link
                    href={organization.social_media.linkedin}
                    target="_blank"
                    rel="noopener"
                  >
                    <Button variant="outlined" startIcon={<LinkedInIcon />}>
                      LinkedIn
                    </Button>
                  </Link>
                )}
                {organization.social_media?.youtube && (
                  <Link
                    href={organization.social_media.youtube}
                    target="_blank"
                    rel="noopener"
                  >
                    <Button variant="outlined" startIcon={<YouTubeIcon />}>
                      YouTube
                    </Button>
                  </Link>
                )}
                {organization.social_media?.website && (
                  <Link
                    href={organization.social_media.website}
                    target="_blank"
                    rel="noopener"
                  >
                    <Button variant="outlined" startIcon={<LanguageIcon />}>
                      Website
                    </Button>
                  </Link>
                )}
              </Box>
            </CardContent>
          </Box>
        </Box>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Edit {organizationType === "club" ? "Club" : "Board"} Details
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={newOrgData.name}
              onChange={handleInputChange}
              variant="outlined"
              required
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newOrgData.description}
              onChange={handleInputChange}
              variant="outlined"
              required
              multiline
              rows={4}
            />

            <TextField
              fullWidth
              label="Established Year"
              name="established_year"
              value={newOrgData.established_year}
              onChange={handleInputChange}
              variant="outlined"
              placeholder="e.g. 2023"
            />

            <Typography variant="subtitle1" fontWeight={500}>
              Social Media Links
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Facebook"
                  name="facebook"
                  value={newOrgData.social_media.facebook}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                  placeholder="Facebook profile URL"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Instagram"
                  name="instagram"
                  value={newOrgData.social_media.instagram}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                  placeholder="Instagram profile URL"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Twitter"
                  name="twitter"
                  value={newOrgData.social_media.twitter}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                  placeholder="Twitter profile URL"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="LinkedIn"
                  name="linkedin"
                  value={newOrgData.social_media.linkedin}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                  placeholder="LinkedIn profile URL"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="YouTube"
                  name="youtube"
                  value={newOrgData.social_media.youtube}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                  placeholder="YouTube channel URL"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={newOrgData.social_media.website}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                  placeholder="Official website URL"
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {organizationType === "club" ? "Club" : "Board"} Image
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button variant="outlined" component="label">
                  Upload New Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
                {newOrgData.image instanceof File && (
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {newOrgData.image.name}
                  </Typography>
                )}
              </Box>
              {!newOrgData.image && imagePreview && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="caption">Current Image:</Typography>
                  <img
                    src={imagePreview}
                    alt="Current"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      marginTop: "8px",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrganizationDetails;
