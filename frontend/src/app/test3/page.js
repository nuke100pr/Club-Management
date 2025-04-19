"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchUserData,getAuthToken } from "@/utils/auth";
import {
  Box,
  Container,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  VpnKey as VpnKeyIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import OrganizationDetails from "../../components/manage/OrganizationDetails";
import PositionManagement from "../../components/manage/PositionManagement";
import PrivilegeTypeManagement from "../../components/manage/PrivilegeTypeManagement";
import BoardClubManagement from "../../components/manage/BoardClubManagement";

const PORManagement = () => {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [managedOrganization, setManagedOrganization] = useState(null);
  const [organizationType, setOrganizationType] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [positions, setPositions] = useState([]);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [privilegeTypes, setPrivilegeTypes] = useState([]);
  const [loadingOrganization, setLoadingOrganization] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Fetch user data and determine organization
  useEffect(() => {
    const loadUserData = async () => {
      setLoadingOrganization(true);
      try {
        const userData = await fetchUserData();
        setCurrentUser(userData.userData);
        console.log("User data loaded:", userData);

        if (userData.isClubAdmin) {
          setOrganizationType("club");
          console.log("Loading club data for ID:", userData?.club_id);
          
          // Ensure club_id exists
          if (!userData?.club_id) {
            throw new Error("Club ID not found in user data");
          }
          
          const clubRes = await fetch(
            `http://localhost:5000/clubs/clubs/${userData.club_id}`
          );
          
          if (!clubRes.ok) {
            throw new Error(`Failed to fetch club data: ${clubRes.status}`);
          }
          
          const clubData = await clubRes.json();

          console.log("Club data loaded:", clubData);
          setManagedOrganization(clubData);
        } else if (userData.isBoardAdmin) {
          setOrganizationType("board");
          console.log("Loading board data for ID:", userData?.board_id);
          
          const boardRes = await fetch(
            `http://localhost:5000/boards/${userData?.board_id}`
          );
          
          if (!boardRes.ok) {
            throw new Error(`Failed to fetch board data: ${boardRes.status}`);
          }
          
          const boardData = await boardRes.json();
          console.log("Board data loaded:", boardData);
          setManagedOrganization(boardData);
        } else {
          console.log("User is not an admin, redirecting to unauthorized");
          router.push("/unauthorized");
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        setSnackbar({
          open: true,
          message: `Failed to load user data: ${err.message}`,
          severity: "error",
        });
      } finally {
        setLoadingOrganization(false);
      }
    };

    loadUserData();
  }, [router]);

  // Debug when positions change
  useEffect(() => {
    console.log("Positions updated:", positions);
  }, [positions]);

  // Debug when organization data changes
  useEffect(() => {
    console.log("Organization type:", organizationType);
    console.log("Managed organization:", managedOrganization);
  }, [organizationType, managedOrganization]);

  // Fetch all necessary data
  useEffect(() => {
    if (!organizationType || !managedOrganization) {
      console.log("Not fetching data: missing organization type or managed organization");
      return;
    }

    const fetchAllData = async () => {
      setLoadingData(true);
      try {
        console.log("Fetching all data for", organizationType, managedOrganization._id);
        
        // Prepare API requests
        const usersPromise = fetch("http://localhost:5000/users/users");
        const privilegeTypesPromise = fetch("http://localhost:5000/por2/privilege-types");
        const positionsPromise = fetch("http://localhost:5000/por2/por");
        
        // Only fetch clubs if this is a board
        const clubsPromise = organizationType === "board" 
          ? fetch(`http://localhost:5000/boards/${managedOrganization._id}/clubs`)
          : Promise.resolve(null);

        const [usersRes, privilegeTypesRes, positionsRes, clubsRes] = await Promise.all([
          usersPromise, privilegeTypesPromise, positionsPromise, clubsPromise
        ]);

        if (!usersRes.ok) throw new Error(`Failed to fetch users: ${usersRes.status}`);
        if (!privilegeTypesRes.ok) throw new Error(`Failed to fetch privilege types: ${privilegeTypesRes.status}`);
        if (!positionsRes.ok) throw new Error(`Failed to fetch positions: ${positionsRes.status}`);
        if (organizationType === "board" && !clubsRes.ok) throw new Error(`Failed to fetch clubs: ${clubsRes.status}`);

        const usersData = await usersRes.json();
        const privilegeTypesData = await privilegeTypesRes.json();
        let positionsData = await positionsRes.json();
        const clubsData = organizationType === "board" ? await clubsRes.json() : [];

        console.log("Users loaded:", usersData.length);
        console.log("Privilege types loaded:", privilegeTypesData.length);
        console.log("Raw positions loaded:", positionsData.length);
        if (organizationType === "board") {
          console.log("Clubs loaded:", clubsData.length);
        }

        setUsers(usersData);
        setPrivilegeTypes(privilegeTypesData);
        setClubs(clubsData);

        // Filter positions based on organization type
        if (organizationType === "board") {
          positionsData = positionsData.filter(position => {
            // Include positions for this board
            if (position?.board_id?._id === managedOrganization._id) {
              return true;
            }
            
            // Include positions for clubs under this board
            if (position?.club_id && clubsData.some(club => club._id === position.club_id._id)) {
              return true;
            }
            
            return false;
          });
        } else if (organizationType === "club") {
          // For club admins, only show positions for their club
          positionsData = positionsData.filter(position => {
            return position?.club_id?._id === managedOrganization._id;
          });
        }

        console.log("Filtered positions:", positionsData.length);
        console.log("Club positions data:", positionsData);

        // Format positions for display
        const formattedPositions = positionsData.map(position => {
          const user = usersData.find(u => u._id === position.user_id?._id) || {};
          const privilege = privilegeTypesData.find(p => p._id === position.privilegeTypeId?._id) || {};

          return {
            ...position,
            user: user.name || "Unknown User",
            email: user.email_id || "N/A",
            position: privilege.position || "Unknown Position",
            status: position.end_date && new Date(position.end_date) < new Date() 
              ? "Completed" 
              : "Active",
          };
        });

        console.log("Formatted positions:", formattedPositions);
        setPositions(formattedPositions);
      } catch (err) {
        console.error("Error fetching data:", err);
        setSnackbar({
          open: true,
          message: `Failed to load data: ${err.message}`,
          severity: "error",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchAllData();
  }, [organizationType, managedOrganization]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUpdateOrganization = async (newOrgData) => {
    try {
      const formData = new FormData();
      formData.append("name", newOrgData.name);
      formData.append("description", newOrgData.description);
      formData.append("established_year", newOrgData.established_year);

      if (newOrgData.image) {
        formData.append("image", newOrgData.image);
      }

      Object.keys(newOrgData.social_media).forEach((key) => {
        if (newOrgData.social_media[key]) {
          formData.append(`social_media[${key}]`, newOrgData.social_media[key]);
        }
      });

      const endpoint = organizationType === "club"
        ? `http://localhost:5000/clubs/clubs/${managedOrganization._id}`
        : `http://localhost:5000/boards/${managedOrganization._id}`;

      console.log("Updating organization at endpoint:", endpoint);
      const response = await fetch(endpoint, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to update organization: ${response.status}`);
      }

      const updatedOrg = await response.json();
      console.log("Organization updated:", updatedOrg);
      setManagedOrganization(updatedOrg);

      setSnackbar({
        open: true,
        message: "Organization updated successfully",
        severity: "success",
      });
      return true;
    } catch (error) {
      console.error("Error updating organization:", error);
      setSnackbar({
        open: true,
        message: `Failed to update organization: ${error.message}`,
        severity: "error",
      });
      return false;
    }
  };

  const handleAddPosition = async (positionData) => {
    try {
      // Prepare data based on organization type
      const porData = {
        ...positionData,
        [`${organizationType}_id`]: managedOrganization._id,
      };
      
      // Handle special case for boards managing club positions
      if (organizationType === "board" && positionData.club_id) {
        porData.club_id = positionData.club_id;
        porData.board_id = null; // Clear board_id if club_id is set
      }

      console.log("Adding position with data:", porData);
      const response = await fetch("http://localhost:5000/por2/por", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(porData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save position: ${response.status}`);
      }

      const newPosition = await response.json();
      console.log("New position created:", newPosition);

      // Format and add the new position to the state
      const user = users.find(u => u._id === newPosition.user_id) || {};
      const privilege = privilegeTypes.find(p => p._id === newPosition.privilegeTypeId) || {};
      
      setPositions(prev => [...prev, {
        ...newPosition,
        user: user.name || "Unknown User",
        email: user.email_id || "N/A",
        position: privilege.position || "Unknown Position",
        status: newPosition.end_date && new Date(newPosition.end_date) < new Date() 
          ? "Completed" 
          : "Active",
        club_id: newPosition.club_id 
          ? clubs.find(c => c._id === newPosition.club_id) 
          : null,
        board_id: newPosition.board_id ? managedOrganization : null,
      }]);

      setSnackbar({
        open: true,
        message: "Position created successfully",
        severity: "success",
      });
      return true;
    } catch (err) {
      console.error("Error submitting POR data:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to save position",
        severity: "error",
      });
      return false;
    }
  };

  const handleEditPosition = async (positionId, positionData) => {
    try {
      // Prepare data based on organization type
      const porData = {
        ...positionData,
        [`${organizationType}_id`]: managedOrganization._id,
      };
      
      // Handle special case for boards managing club positions
      if (organizationType === "board" && positionData.club_id) {
        porData.club_id = positionData.club_id;
        porData.board_id = null; // Clear board_id if club_id is set
      }

      console.log("Editing position:", positionId, porData);
      const response = await fetch(`http://localhost:5000/por2/por/${positionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(porData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update position: ${response.status}`);
      }

      const updatedPosition = await response.json();
      console.log("Position updated:", updatedPosition);

      // Update the position in state
      setPositions(prev => prev.map(pos => {
        if (pos._id === updatedPosition._id) {
          const user = users.find(u => u._id === updatedPosition.user_id) || {};
          const privilege = privilegeTypes.find(p => p._id === updatedPosition.privilegeTypeId) || {};
          
          return {
            ...pos,
            ...updatedPosition,
            user: user.name || "Unknown User",
            email: user.email_id || "N/A",
            position: privilege.position || "Unknown Position",
            status: updatedPosition.end_date && new Date(updatedPosition.end_date) < new Date() 
              ? "Completed" 
              : "Active",
            club_id: updatedPosition.club_id 
              ? clubs.find(c => c._id === updatedPosition.club_id) 
              : null,
            board_id: updatedPosition.board_id ? managedOrganization : null,
          };
        }
        return pos;
      }));

      setSnackbar({
        open: true,
        message: "Position updated successfully",
        severity: "success",
      });
      return true;
    } catch (err) {
      console.error("Error updating POR data:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to update position",
        severity: "error",
      });
      return false;
    }
  };

  const handleDeletePosition = async (position) => {
    try {
      console.log("Deleting position:", position._id);
      const response = await fetch(`http://localhost:5000/por2/por/${position._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete position: ${response.status}`);
      }

      // Remove the position from state
      setPositions(prev => prev.filter(pos => pos._id !== position._id));

      setSnackbar({
        open: true,
        message: "Position deleted successfully",
        severity: "success",
      });
      return true;
    } catch (err) {
      console.error("Error deleting POR:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete position",
        severity: "error",
      });
      return false;
    }
  };

  const handleAddPrivilegeType = async (privilegeData) => {
    try {
      console.log("Adding privilege type:", privilegeData);
      const response = await fetch("http://localhost:5000/por2/privilege-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(privilegeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save privilege type: ${response.status}`);
      }

      const newPrivilege = await response.json();
      console.log("New privilege type created:", newPrivilege);
      setPrivilegeTypes(prev => [...prev, newPrivilege]);

      setSnackbar({
        open: true,
        message: "Privilege type created successfully",
        severity: "success",
      });
      return true;
    } catch (err) {
      console.error("Error submitting privilege data:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to save privilege type",
        severity: "error",
      });
      return false;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Show loading state when fetching organization or data
  if (loadingOrganization) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Box ml={2}>Loading organization data...</Box>
      </Box>
    );
  }

  if (!currentUser || !managedOrganization) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Box ml={2}>Loading user data...</Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <div>Organization Type: {organizationType}</div>
            <div>Organization ID: {managedOrganization._id}</div>
            <div>Organization Name: {managedOrganization.name}</div>
          </Box>
        )}
        
        <OrganizationDetails
          organization={managedOrganization}
          organizationType={organizationType}
          onUpdate={handleUpdateOrganization}
        />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ mb: 3 }}
        >
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Positions"
            sx={{ fontWeight: "bold" }}
          />
          <Tab
            icon={<VpnKeyIcon />}
            iconPosition="start"
            label="Privilege Types"
            sx={{ fontWeight: "bold" }}
          />
          {organizationType === "board" && (
            <Tab
              icon={<GroupsIcon />}
              iconPosition="start"
              label="Manage Clubs"
              sx={{ fontWeight: "bold" }}
            />
          )}
        </Tabs>

        {tabValue === 0 && (
          <Box>
            {loadingData ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
                <Box ml={2}>Loading positions data...</Box>
              </Box>
            ) : (
              <PositionManagement
                positions={positions}
                users={users}
                privilegeTypes={privilegeTypes}
                organizationType={organizationType}
                loading={loadingData}
                onAddPosition={handleAddPosition}
                onEditPosition={handleEditPosition}
                onDeletePosition={handleDeletePosition}
                clubs={organizationType === "board" ? clubs : []}
              />
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            {loadingData ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
                <Box ml={2}>Loading privilege types...</Box>
              </Box>
            ) : (
              <PrivilegeTypeManagement
                privilegeTypes={privilegeTypes}
                loading={loadingData}
                onAddPrivilegeType={handleAddPrivilegeType}
              />
            )}
          </Box>
        )}

        {tabValue === 2 && organizationType === "board" && (
          <BoardClubManagement boardId={managedOrganization._id} />
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default PORManagement;