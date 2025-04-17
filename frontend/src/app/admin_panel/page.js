"use client";

import { useState,useEffect } from "react";
import { 
  Box,
  Paper,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Fade
} from "@mui/material";
import Layout from "../../components/admin_panel/Layout";
import Dashboard from "../../components/admin_panel/Dashboard";
import Boards from "../../components/admin_panel/Boards";
import Clubs from "../../components/admin_panel/Clubs";
import Users from "../../components/admin_panel/Users";
import POR from "../../components/admin_panel/POR";
import AdminManagement from "../../components/admin_panel/ManageAdmin";
import SuperAdminManagement from "../../components/admin_panel/SuperAdminManagement";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [previousTab, setPreviousTab] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event, newValue) => {
    if (newValue !== activeTab) {
      setIsTransitioning(true);
      // Store the previous tab before changing
      setPreviousTab(activeTab);
      
      // Short delay to allow fade-out before changing the tab
      setTimeout(() => {
        setActiveTab(newValue);
        // Allow fade-in animation to start
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 200);
    }
  };

  // Custom function to handle sidebar tab changes
  const handleSidebarTabChange = (tabValue) => {
    if (tabValue !== activeTab) {
      setIsTransitioning(true);
      setPreviousTab(activeTab);
      
      setTimeout(() => {
        setActiveTab(tabValue);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 200);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "boards":
        return <Boards />;
      case "clubs":
        return <Clubs />;
      case "users":
        return <Users />;
      case "por":
        return <POR />;
      case "admin_manage":
        return <AdminManagement />;
      case "super_admin_manage":
        return <SuperAdminManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: '100vh',
      }}>
        <Layout
          activeTab={activeTab}
          setActiveTab={handleSidebarTabChange}
          isMobile={isMobile}
        >
{/* Mobile Tab Navigation */}
{isMobile && (
  <Paper
    sx={{
      mb: 3,
      position: "sticky",
      top: 0,
      zIndex: 1000, // Ensure it stays above other content
      backgroundColor: "background.paper",
    }}
  >
    <Tabs
      value={activeTab}
      onChange={handleTabChange}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label="admin panel tabs"
    >
      <Tab value="dashboard" label="Dashboard" />
      <Tab value="boards" label="Boards" />
      <Tab value="clubs" label="Clubs" />
      <Tab value="users" label="Users" />
      <Tab value="por" label="POR" />
      <Tab value="admin_manage" label="Admin Management" />
      <Tab value="super_admin_manage" label="Super Admin Management" />
    </Tabs>
  </Paper>
)}



          <Fade 
            in={!isTransitioning} 
            timeout={{ enter: 500, exit: 200 }}
            style={{ 
              transitionProperty: 'opacity, transform',
              transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)'
            }}
          >
            <Paper sx={{ 
              p: 3,
              minHeight: '80vh', // Ensure consistent height during transitions
              position: 'relative'
            }}>
              {renderTab()}
            </Paper>
          </Fade>
        </Layout>
      </Box>
    </>
  );
}