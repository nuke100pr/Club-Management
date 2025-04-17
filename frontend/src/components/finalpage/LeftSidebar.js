import { Box, List, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import Link from 'next/link';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import DescriptionIcon from '@mui/icons-material/Description';
import ForumIcon from '@mui/icons-material/Forum';
import GroupsIcon from '@mui/icons-material/Groups';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const sidebarItems = [
  { label: 'Events', path: '/events', icon: <EventIcon /> },
  { label: 'Projects', path: '/projects', icon: <WorkIcon /> },
  { label: 'Opportunities', path: '/opportunities', icon: <BusinessCenterIcon /> },
  { label: 'Calendar', path: '/calendar', icon: <CalendarTodayIcon /> },
  { label: 'Resources', path: '/resources', icon: <LibraryBooksIcon /> },
  { label: 'Blogs', path: '/blogs', icon: <DescriptionIcon /> },
  { label: 'Forums', path: '/forums', icon: <ForumIcon /> },
  { label: 'Clubs', path: '/clubs', icon: <GroupsIcon /> },
  { label: 'Admin Panel', path: '/admin_panel', icon: <AdminPanelSettingsIcon /> },
  { label: 'Manage', path: '/test3', icon: <ManageAccountsIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

export default function LeftSidebar() {
  const theme = useTheme();
  const router = useRouter();
  
  const handleLogout = () => {
    // Remove the auth_token cookie
    Cookies.remove('auth_token');
    // Redirect to login page
    router.push('/login');
  };
  
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.background.paper, // Changed from gradient to solid background
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between', // This will push the logout button to the bottom
      }}
    >
      <List
        sx={{
          width: '100%',
          padding: 1,
          overflow: 'auto',
          '& .MuiListItemButton-root': {
            borderRadius: 1,
            mb: 0.5,
            '&:hover': {
              filter: 'brightness(1.1)',
            },
          },
          '& .MuiListItemIcon-root': {
            color: theme.palette.common.white,
            minWidth: 40,
          },
          '& .MuiListItemText-primary': {
            color: theme.palette.common.white,
            fontWeight: 500,
          },
        }}
      >
        {sidebarItems.map(({ label, path, icon }) => (
          <Link key={label} href={path} passHref legacyBehavior>
            <ListItemButton 
              component="a"
              sx={{
                background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)', // Kept the gradient for tabs
                '&:hover': {
                  background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)', // Kept gradient on hover
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', // Added subtle shadow on hover
                },
              }}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </Link>
        ))}
      </List>
      
      {/* Logout Button */}
      <List sx={{ padding: 1 }}>
        <ListItemButton 
          onClick={handleLogout}
          sx={{
            background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)', // Kept gradient for logout button
            '&:hover': {
              background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)', // Kept gradient on hover
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', // Added subtle shadow on hover
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: theme.palette.common.white }} />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: theme.palette.common.white }} />
        </ListItemButton>
      </List>
    </Box>
  );
}