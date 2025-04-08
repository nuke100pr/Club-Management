"use client";
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Container,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = ({ userImage = "/api/placeholder/40/40" }) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    // Example: router.push('/login');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "white", color: "primary.main", boxShadow: 1 }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo/Brand */}
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              fontWeight: "bold",
              display: { xs: "none", sm: "block" }
            }}
          >
            Your Brand
          </Typography>

          {/* Navigation Items */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Link href="/" passHref style={{ textDecoration: "none" }}>
              <Button
                startIcon={<HomeIcon />}
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.light",
                    color: "white",
                  },
                }}
              >
                Home
              </Button>
            </Link>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "primary.main",
                  color: "white",
                },
              }}
            >
              Logout
            </Button>

            {/* User Avatar */}
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar 
                src={userImage} 
                alt="User"
                sx={{ 
                  width: 40, 
                  height: 40,
                  border: 1,
                  borderColor: "grey.300" 
                }}
              />
            </IconButton>
            
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "account-button",
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;