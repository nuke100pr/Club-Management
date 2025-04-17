import { Box, useTheme, useMediaQuery } from "@mui/material";
import Sidebar from "./Sidebar";

const Layout = ({ children, activeTab, setActiveTab }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
   <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflowX: "hidden",
        backgroundColor: theme.palette.background.default,
      }}
    >
       {!isMobile &&(<Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />)}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;