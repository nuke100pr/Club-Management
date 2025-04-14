import { Box, useTheme } from '@mui/material';
import OpportunitiesSidebar from './OpportunitiesSidebar';
import EventsSidebar from './EventsSidebar';

export default function RightSidebar() {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      borderLeft: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : '#ccc'}`,
      height: '100vh', 
      p: 2, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2,
      overflow: 'hidden', // Prevent scrollbar on the container
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      '& *::-webkit-scrollbar': {
        display: 'none', // Hide scrollbar for webkit browsers
      },
      '& *': {
        msOverflowStyle: 'none',  // IE and Edge
        scrollbarWidth: 'none',   // Firefox
      }
    }}>
      <Box sx={{ 
        height: 'calc(50% - 1rem)', // Take half the height minus half the gap
        overflow: 'hidden',
        '&:hover': {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '4px',
            height: '100%',
            backgroundImage: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
            opacity: 0.5,
            borderRadius: '0 4px 4px 0',
          }
        },
        position: 'relative'
      }}>
        <OpportunitiesSidebar />
      </Box>
      <Box sx={{ 
        height: 'calc(50% - 1rem)', // Take half the height minus half the gap
        overflow: 'hidden',
        '&:hover': {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '4px',
            height: '100%',
            backgroundImage: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
            opacity: 0.5,
            borderRadius: '0 4px 4px 0',
          }
        },
        position: 'relative'
      }}>
        <EventsSidebar />
      </Box>
    </Box>
  );
}