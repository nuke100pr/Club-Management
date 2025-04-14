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
  
  return (
    <Box
      sx={{
        width: 250,
        height: '100%',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)' 
          : 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <List
        sx={{
          '& .MuiListItemButton-root': {
            borderRadius: 1,
            mb: 0.5,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.04)',
            },
          },
          '& .MuiListItemIcon-root': {
            color: theme.palette.mode === 'dark' 
              ? theme.palette.common.white 
              : theme.palette.common.white,
            minWidth: 40,
          },
          '& .MuiListItemText-primary': {
            color: theme.palette.mode === 'dark' 
              ? theme.palette.common.white 
              : theme.palette.common.white,
            fontWeight: 500,
          },
        }}
      >
        {sidebarItems.map(({ label, path, icon }) => (
          <Link key={label} href={path} passHref legacyBehavior>
            <ListItemButton 
              component="a"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </Link>
        ))}
      </List>
    </Box>
  );
}