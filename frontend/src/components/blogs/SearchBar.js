// pages/index.js
"use client";
import React, { useState } from 'react';
import { 
  AppBar,
  Toolbar,
  InputBase,
  IconButton,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  alpha,
  styled,
  Typography,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';

// Club management app colors
const primaryColor = '#5f259f';   // PhonePe Purple
const secondaryColor = '#7e3fc2'; // A slightly lighter violet for accents


const MotionAppBar = styled(motion.div)(({ theme }) => ({
  width: '100%',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.2)',
  transition: 'all 0.3s ease',
}));

const SearchContainer = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
  maxWidth: '600px',
  margin: '0 16px',
  [theme.breakpoints.down('sm')]: {
    margin: '0 8px',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: 40,
  borderRadius: 20,
  backgroundColor: alpha('#fff', 0.15),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha('#fff', 0.25),
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'white',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: theme.spacing(5),
    transition: theme.transitions.create('width'),
    width: '100%',
    '&::placeholder': {
      color: alpha('#fff', 0.7),
      opacity: 1,
    },
  },
}));

const FilterIconButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  marginRight: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha('#fff', 0.1),
    transform: 'rotate(90deg)',
  },
}));

const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  color: 'white',
  margin: theme.spacing(0, 0.5),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha('#fff', 0.15),
    transform: 'translateY(-2px)',
  },
}));

const LogoContainer = styled(motion.div)({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
});

const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
  },
}));

export default function ClubManagementNavbar({ 
  searchQuery, 
  onSearchChange, 
  onBackClick,
  showBackButton = false 
}) {
  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState({
    events: false,
    members: false,
    announcements: false,
    meetings: false,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.checked,
    });
  };

  const handleApplyFilters = () => {
    console.log('Applied filters:', filters);
    handleCloseFilter();
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMenuAnchor);

  return (
    <MotionAppBar
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <StyledAppBar position="static">
        <Toolbar>
          {showBackButton && (
            <IconButtonStyled
              onClick={onBackClick}
              component={motion.button}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowBackIcon />
            </IconButtonStyled>
          )}

          <IconButtonStyled
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <HomeIcon />
          </IconButtonStyled>

          <LogoContainer
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontWeight: 700,
                letterSpacing: 0.5,
                mr: 2,
                color: 'white'
              }}
            >
              Club Manager
            </Typography>
          </LogoContainer>

          <MobileMenuButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </MobileMenuButton>

          <SearchContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <StyledPaper component={motion.div} whileHover={{ scale: 1.02 }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search events, members, announcements..."
                inputProps={{ 'aria-label': 'search' }}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <FilterIconButton
                size="small"
                onClick={handleOpenFilter}
                aria-label="filter"
                component={motion.button}
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <FilterListIcon />
              </FilterIconButton>
            </StyledPaper>
          </SearchContainer>

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButtonStyled 
              onClick={handleProfileMenuOpen}
              component={motion.button}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <AccountCircleIcon />
            </IconButtonStyled>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            mt: 1.5,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>My Account</MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
        <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
      </Menu>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            mt: 1.5,
            width: 200,
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMobileMenuClose}>
          <HomeIcon sx={{ mr: 1 }} />
          Home
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMobileMenuClose}>
          <AccountCircleIcon sx={{ mr: 1 }} />
          Profile
        </MenuItem>
      </Menu>

      {/* Filter Dialog */}
      <Dialog 
        open={openFilter} 
        onClose={handleCloseFilter}
        PaperProps={{
          component: motion.div,
          layoutId: "filter-dialog",
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, 
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          Filter Results
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormGroup>
              {Object.entries({
                events: "Events",
                members: "Members",
                announcements: "Announcements",
                meetings: "Meetings"
              }).map(([key, label]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox 
                      checked={filters[key]}
                      onChange={handleFilterChange}
                      name={key}
                      sx={{
                        color: primaryColor,
                        '&.Mui-checked': {
                          color: primaryColor,
                        },
                      }}
                    />
                  }
                  label={label}
                  component={motion.div}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                />
              ))}
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseFilter} 
            sx={{ color: 'gray' }}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApplyFilters} 
            sx={{ 
              background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              color: 'white',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              },
            }}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </MotionAppBar>
  );
}