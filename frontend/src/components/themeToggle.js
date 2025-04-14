// components/ThemeToggle.js
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { motion } from 'framer-motion';
import { useThemeContext } from '../context/ThemeContext';

const MotionIconButton = motion(IconButton);

const StyledToggleButton = styled(MotionIconButton)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.secondary.main,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(93, 141, 247, 0.15)' 
    : 'rgba(142, 84, 233, 0.1)',
  borderRadius: '50%',
  width: 40,
  height: 40,
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(93, 141, 247, 0.25)' 
      : 'rgba(142, 84, 233, 0.2)',
    transform: 'scale(1.1)',
  },
}));

const ThemeToggle = () => {
  const { mode, toggleColorMode } = useThemeContext();
  
  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <StyledToggleButton
        onClick={toggleColorMode}
        whileTap={{ scale: 0.9, rotate: 180 }}
        transition={{ duration: 0.5 }}
        aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
      >
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </StyledToggleButton>
    </Tooltip>
  );
};

export default ThemeToggle;