// // // pages/index.js
// // "use client";
// // import React, { useState } from 'react';
// // import { 
// //   AppBar,
// //   Toolbar,
// //   InputBase,
// //   IconButton,
// //   Paper,
// //   Box,
// //   Button,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   FormControl,
// //   FormGroup,
// //   FormControlLabel,
// //   Checkbox,
// //   alpha,
// //   styled,
// //   Typography,
// //   Menu,
// //   MenuItem,
// //   Divider
// // } from '@mui/material';
// // import { motion } from 'framer-motion';
// // import SearchIcon from '@mui/icons-material/Search';
// // import FilterListIcon from '@mui/icons-material/FilterList';
// // import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// // import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// // import HomeIcon from '@mui/icons-material/Home';
// // import MenuIcon from '@mui/icons-material/Menu';

// // // Club management app colors
// // const primaryColor = '#5f259f';   // PhonePe Purple
// // const secondaryColor = '#7e3fc2'; // A slightly lighter violet for accents


// // const MotionAppBar = styled(motion.div)(({ theme }) => ({
// //   width: '100%',
// //   position: 'sticky',
// //   top: 0,
// //   zIndex: theme.zIndex.drawer + 1,
// // }));

// // const StyledAppBar = styled(AppBar)(({ theme }) => ({
// //   background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
// //   boxShadow: '0 4px 20px rgba(25, 118, 210, 0.2)',
// //   transition: 'all 0.3s ease',
// // }));

// // const SearchContainer = styled(motion.div)(({ theme }) => ({
// //   display: 'flex',
// //   alignItems: 'center',
// //   flexGrow: 1,
// //   maxWidth: '600px',
// //   margin: '0 16px',
// //   [theme.breakpoints.down('sm')]: {
// //     margin: '0 8px',
// //   },
// // }));

// // const StyledPaper = styled(Paper)(({ theme }) => ({
// //   display: 'flex',
// //   alignItems: 'center',
// //   width: '100%',
// //   height: 40,
// //   borderRadius: 20,
// //   backgroundColor: alpha('#fff', 0.15),
// //   transition: 'all 0.3s ease',
// //   '&:hover': {
// //     backgroundColor: alpha('#fff', 0.25),
// //     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
// //     transform: 'translateY(-2px)',
// //   },
// // }));

// // const SearchIconWrapper = styled('div')(({ theme }) => ({
// //   padding: theme.spacing(0, 2),
// //   height: '100%',
// //   position: 'absolute',
// //   pointerEvents: 'none',
// //   display: 'flex',
// //   alignItems: 'center',
// //   justifyContent: 'center',
// //   color: 'white',
// // }));

// // const StyledInputBase = styled(InputBase)(({ theme }) => ({
// //   color: 'white',
// //   width: '100%',
// //   '& .MuiInputBase-input': {
// //     padding: theme.spacing(1, 1, 1, 0),
// //     paddingLeft: theme.spacing(5),
// //     transition: theme.transitions.create('width'),
// //     width: '100%',
// //     '&::placeholder': {
// //       color: alpha('#fff', 0.7),
// //       opacity: 1,
// //     },
// //   },
// // }));

// // const FilterIconButton = styled(IconButton)(({ theme }) => ({
// //   color: 'white',
// //   marginRight: theme.spacing(1),
// //   transition: 'all 0.3s ease',
// //   '&:hover': {
// //     backgroundColor: alpha('#fff', 0.1),
// //     transform: 'rotate(90deg)',
// //   },
// // }));

// // const IconButtonStyled = styled(IconButton)(({ theme }) => ({
// //   color: 'white',
// //   margin: theme.spacing(0, 0.5),
// //   transition: 'all 0.3s ease',
// //   '&:hover': {
// //     backgroundColor: alpha('#fff', 0.15),
// //     transform: 'translateY(-2px)',
// //   },
// // }));

// // const LogoContainer = styled(motion.div)({
// //   display: 'flex',
// //   alignItems: 'center',
// //   cursor: 'pointer',
// // });

// // const MobileMenuButton = styled(IconButton)(({ theme }) => ({
// //   color: 'white',
// //   display: 'none',
// //   [theme.breakpoints.down('md')]: {
// //     display: 'flex',
// //   },
// // }));

// // export default function ClubManagementNavbar({ 
// //   searchQuery, 
// //   onSearchChange, 
// //   onBackClick,
// //   showBackButton = false 
// // }) {
// //   const [openFilter, setOpenFilter] = useState(false);
// //   const [filters, setFilters] = useState({
// //     events: false,
// //     members: false,
// //     announcements: false,
// //     meetings: false,
// //   });
// //   const [anchorEl, setAnchorEl] = useState(null);
// //   const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

// //   const handleOpenFilter = () => {
// //     setOpenFilter(true);
// //   };

// //   const handleCloseFilter = () => {
// //     setOpenFilter(false);
// //   };

// //   const handleFilterChange = (event) => {
// //     setFilters({
// //       ...filters,
// //       [event.target.name]: event.target.checked,
// //     });
// //   };

// //   const handleApplyFilters = () => {
// //     console.log('Applied filters:', filters);
// //     handleCloseFilter();
// //   };

// //   const handleProfileMenuOpen = (event) => {
// //     setAnchorEl(event.currentTarget);
// //   };

// //   const handleMenuClose = () => {
// //     setAnchorEl(null);
// //   };

// //   const handleMobileMenuOpen = (event) => {
// //     setMobileMenuAnchor(event.currentTarget);
// //   };

// //   const handleMobileMenuClose = () => {
// //     setMobileMenuAnchor(null);
// //   };

// //   const isMenuOpen = Boolean(anchorEl);
// //   const isMobileMenuOpen = Boolean(mobileMenuAnchor);

// //   return (
// //     <MotionAppBar
// //       initial={{ y: -100, opacity: 0 }}
// //       animate={{ y: 0, opacity: 1 }}
// //       transition={{ type: "spring", stiffness: 100, damping: 15 }}
// //     >
// //       <StyledAppBar position="static">
// //         <Toolbar>
// //           {showBackButton && (
// //             <IconButtonStyled
// //               onClick={onBackClick}
// //               component={motion.button}
// //               whileHover={{ scale: 1.1 }}
// //               transition={{ type: "spring", stiffness: 400, damping: 10 }}
// //             >
// //               <ArrowBackIcon />
// //             </IconButtonStyled>
// //           )}

// //           <IconButtonStyled
// //             component={motion.button}
// //             whileHover={{ scale: 1.1 }}
// //             transition={{ type: "spring", stiffness: 400, damping: 10 }}
// //           >
// //             <HomeIcon />
// //           </IconButtonStyled>

// //           <LogoContainer
// //             whileHover={{ scale: 1.05 }}
// //             whileTap={{ scale: 0.95 }}
// //           >
// //             <Typography
// //               variant="h6"
// //               noWrap
// //               component="div"
// //               sx={{ 
// //                 display: 'flex', 
// //                 alignItems: 'center', 
// //                 fontWeight: 700,
// //                 letterSpacing: 0.5,
// //                 mr: 2,
// //                 color: 'white'
// //               }}
// //             >
// //               Club Manager
// //             </Typography>
// //           </LogoContainer>

// //           <MobileMenuButton
// //             edge="start"
// //             color="inherit"
// //             aria-label="menu"
// //             onClick={handleMobileMenuOpen}
// //           >
// //             <MenuIcon />
// //           </MobileMenuButton>

// //           <SearchContainer
// //             initial={{ opacity: 0, scale: 0.9 }}
// //             animate={{ opacity: 1, scale: 1 }}
// //             transition={{ delay: 0.2 }}
// //           >
// //             <StyledPaper component={motion.div} whileHover={{ scale: 1.02 }}>
// //               <SearchIconWrapper>
// //                 <SearchIcon />
// //               </SearchIconWrapper>
// //               <StyledInputBase
// //                 placeholder="Search events, members, announcements..."
// //                 inputProps={{ 'aria-label': 'search' }}
// //                 value={searchQuery}
// //                 onChange={(e) => onSearchChange(e.target.value)}
// //               />
// //               <FilterIconButton
// //                 size="small"
// //                 onClick={handleOpenFilter}
// //                 aria-label="filter"
// //                 component={motion.button}
// //                 whileHover={{ rotate: 180 }}
// //                 transition={{ duration: 0.3 }}
// //               >
// //                 <FilterListIcon />
// //               </FilterIconButton>
// //             </StyledPaper>
// //           </SearchContainer>

// //           <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
// //             <IconButtonStyled 
// //               onClick={handleProfileMenuOpen}
// //               component={motion.button}
// //               whileHover={{ scale: 1.1 }}
// //               transition={{ type: "spring", stiffness: 400, damping: 10 }}
// //             >
// //               <AccountCircleIcon />
// //             </IconButtonStyled>
// //           </Box>
// //         </Toolbar>
// //       </StyledAppBar>

// //       {/* Profile Menu */}
// //       <Menu
// //         anchorEl={anchorEl}
// //         open={isMenuOpen}
// //         onClose={handleMenuClose}
// //         PaperProps={{
// //           elevation: 3,
// //           sx: {
// //             borderRadius: 2,
// //             mt: 1.5,
// //             overflow: 'visible',
// //             filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
// //             '&:before': {
// //               content: '""',
// //               display: 'block',
// //               position: 'absolute',
// //               top: 0,
// //               right: 14,
// //               width: 10,
// //               height: 10,
// //               bgcolor: 'background.paper',
// //               transform: 'translateY(-50%) rotate(45deg)',
// //               zIndex: 0,
// //             },
// //           },
// //         }}
// //         transformOrigin={{ horizontal: 'right', vertical: 'top' }}
// //         anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
// //       >
// //         <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
// //         <MenuItem onClick={handleMenuClose}>My Account</MenuItem>
// //         <Divider />
// //         <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
// //         <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
// //       </Menu>

// //       {/* Mobile Menu */}
// //       <Menu
// //         anchorEl={mobileMenuAnchor}
// //         open={isMobileMenuOpen}
// //         onClose={handleMobileMenuClose}
// //         PaperProps={{
// //           elevation: 3,
// //           sx: {
// //             borderRadius: 2,
// //             mt: 1.5,
// //             width: 200,
// //           },
// //         }}
// //         transformOrigin={{ horizontal: 'left', vertical: 'top' }}
// //         anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
// //       >
// //         <MenuItem onClick={handleMobileMenuClose}>
// //           <HomeIcon sx={{ mr: 1 }} />
// //           Home
// //         </MenuItem>
// //         <Divider />
// //         <MenuItem onClick={handleMobileMenuClose}>
// //           <AccountCircleIcon sx={{ mr: 1 }} />
// //           Profile
// //         </MenuItem>
// //       </Menu>

// //       {/* Filter Dialog */}
// //       <Dialog 
// //         open={openFilter} 
// //         onClose={handleCloseFilter}
// //         PaperProps={{
// //           component: motion.div,
// //           layoutId: "filter-dialog",
// //           sx: { borderRadius: 3 }
// //         }}
// //       >
// //         <DialogTitle sx={{ 
// //           background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, 
// //           color: 'white',
// //           borderRadius: '12px 12px 0 0'
// //         }}>
// //           Filter Results
// //         </DialogTitle>
// //         <DialogContent>
// //           <FormControl component="fieldset" sx={{ mt: 2 }}>
// //             <FormGroup>
// //               {Object.entries({
// //                 events: "Events",
// //                 members: "Members",
// //                 announcements: "Announcements",
// //                 meetings: "Meetings"
// //               }).map(([key, label]) => (
// //                 <FormControlLabel
// //                   key={key}
// //                   control={
// //                     <Checkbox 
// //                       checked={filters[key]}
// //                       onChange={handleFilterChange}
// //                       name={key}
// //                       sx={{
// //                         color: primaryColor,
// //                         '&.Mui-checked': {
// //                           color: primaryColor,
// //                         },
// //                       }}
// //                     />
// //                   }
// //                   label={label}
// //                   component={motion.div}
// //                   whileHover={{ x: 5 }}
// //                   transition={{ type: "spring", stiffness: 400, damping: 17 }}
// //                 />
// //               ))}
// //             </FormGroup>
// //           </FormControl>
// //         </DialogContent>
// //         <DialogActions>
// //           <Button 
// //             onClick={handleCloseFilter} 
// //             sx={{ color: 'gray' }}
// //             component={motion.button}
// //             whileHover={{ scale: 1.05 }}
// //             whileTap={{ scale: 0.95 }}
// //           >
// //             Cancel
// //           </Button>
// //           <Button 
// //             onClick={handleApplyFilters} 
// //             sx={{ 
// //               background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
// //               color: 'white',
// //               '&:hover': {
// //                 boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
// //               },
// //             }}
// //             component={motion.button}
// //             whileHover={{ scale: 1.05 }}
// //             whileTap={{ scale: 0.95 }}
// //           >
// //             Apply
// //           </Button>
// //         </DialogActions>
// //       </Dialog>
// //     </MotionAppBar>
// //   );
// // }

// "use client";
// import React, { useState, useEffect } from 'react';
// import {
//   TextField,
//   InputAdornment,
//   IconButton,
//   Box,
//   Typography,
//   Drawer,
//   Divider,
//   Button,
//   FormControl,
//   FormGroup,
//   FormControlLabel,
//   Checkbox,
//   Paper,
//   Badge,
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import SearchIcon from '@mui/icons-material/Search';
// import TuneIcon from '@mui/icons-material/Tune';
// import CloseIcon from '@mui/icons-material/Close';

// // Colors
// const primaryColor = '#4776E6'; // Events page primary color for accents
// const textColor = '#2A3B4F'; // Dark text for contrast on white background

// // Filters for Blogs page
// const filters = ["My Clubs", "My Boards"];

// export default function SearchBar({
//   searchQuery,
//   onSearchChange,
//   selectedFilters = {},
//   onFilterChange,
//   clearFilters,
// }) {
//   const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
//   const [isSticky, setIsSticky] = useState(false);

//   // Handle scroll event to make the search bar sticky
//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollPosition = window.scrollY;
//       setIsSticky(scrollPosition > 100);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//     };
//   }, []);

//   const toggleFilterDrawer = () => {
//     setFilterDrawerOpen(!filterDrawerOpen);
//   };

//   const activeFiltersCount = Object.values(selectedFilters).filter(Boolean).length;

//   return (
//     <>
//       <Box
//         sx={{
//           mb: isSticky ? 16 : 3, // Add margin bottom when sticky, 24px when not sticky
//           position: 'relative',
//           zIndex: 1100,
//         }}
//       >
//         <Paper
//           elevation={isSticky ? 4 : 0}
//           sx={{
//             borderRadius: '16px',
//             background: '#FFFFFF', // Whitish background
//             boxShadow: isSticky
//               ? '0 6px 16px rgba(0, 0, 0, 0.1)'
//               : '0 4px 12px rgba(0, 0, 0, 0.05)',
//             overflow: 'hidden',
//             transition: 'all 0.3s ease',
//             '&:hover': {
//               boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
//             },
//             position: isSticky ? 'fixed' : 'relative',
//             top: isSticky ? 0 : 'auto',
//             left: isSticky ? 0 : 'auto',
//             right: isSticky ? 0 : 'auto',
//             width: isSticky ? 'calc(100% - 32px)' : '100%',
//             maxWidth: isSticky ? '1200px' : '100%',
//             margin: isSticky ? '16px auto' : 0,
//             transform: isSticky ? 'translateY(0)' : 'none',
//             animation: isSticky ? 'slideDown 0.3s ease' : 'none',
//             '@keyframes slideDown': {
//               from: { transform: 'translateY(-100%)' },
//               to: { transform: 'translateY(0)' },
//             },
//           }}
//         >
//           <Box sx={{ py: 0.5, px: 2, display: 'flex', alignItems: 'center' }}>
//           <TextField
//               fullWidth
//               variant="standard"
//               placeholder="Search blogs..."
//               value={searchQuery}
//               onChange={(e) => onSearchChange(e.target.value)}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon sx={{ color: '#4776E6', opacity: 0.8 }} />
//                   </InputAdornment>
//                 ),
//                 disableUnderline: true,
//                 sx: { 
//                   fontSize: '0.95rem',
//                   color: '#2A3B4F',
//                   '&::placeholder': {
//                     color: '#607080',
//                     opacity: 0.7
//                   }
//                 }
//               }}
//               sx={{ 
//                 maxWidth: '100%',
//                 '& .MuiInputBase-root': {
//                   backgroundColor: 'rgba(248, 250, 255, 0.8)',
//                   borderRadius: '12px',
//                   pl: 1,
//                   height: 48,
//                   transition: 'all 0.3s ease',
//                   '&:hover, &:focus-within': {
//                     backgroundColor: 'rgba(248, 250, 255, 1)',
//                     boxShadow: '0 2px 8px rgba(95, 150, 230, 0.1)'
//                   }
//                 }
//               }}
//             />
//             <Box sx={{ flexGrow: 1 }} />
            
//             <Button
//               onClick={toggleFilterDrawer}
//               startIcon={<TuneIcon />}
//               variant={activeFiltersCount > 0 ? "contained" : "outlined"}
//               size="medium"
//               sx={{ 
//                 ml: 2,
//                 borderRadius: '8px', 
//                 textTransform: 'none',
//                 fontWeight: 500,
//                 px: 2,
//                 height: 40,
//                 ...(activeFiltersCount > 0 
//                   ? {
//                       background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
//                       boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
//                       '&:hover': {
//                         boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
//                         background: 'linear-gradient(90deg, #3a5fc0 0%, #7b46c7 100%)',
//                       }
//                     } 
//                   : {
//                       borderColor: '#4776E6',
//                       color: '#4776E6',
//                       '&:hover': {
//                         borderColor: '#3a5fc0',
//                         color: '#3a5fc0',
//                         backgroundColor: 'rgba(71, 118, 230, 0.05)'
//                       }
//                     })
//               }}
//             >
//               Filters
//               {activeFiltersCount > 0 && (
//                 <Box
//                   sx={{
//                     ml: 1,
//                     bgcolor: activeFiltersCount > 0 ? 'rgba(255, 255, 255, 0.8)' : '#4776E6',
//                     color: activeFiltersCount > 0 ? '#4776E6' : 'white',
//                     borderRadius: '50%',
//                     width: 20,
//                     height: 20,
//                     fontSize: 12,
//                     fontWeight: 600,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}
//                 >
//                   {activeFiltersCount}
//                 </Box>
//               )}
//             </Button>
//           </Box>
//         </Paper>
//       </Box>

//       {/* Filter Drawer */}
//       <Drawer
//         anchor="right"
//         open={filterDrawerOpen}
//         onClose={toggleFilterDrawer}
//         PaperProps={{
//           sx: {
//             borderTopLeftRadius: 16,
//             borderBottomLeftRadius: 16,
//             boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
//             backgroundColor: '#FFFFFF',
//           },
//         }}
//       >
//         <Box sx={{ width: 320, p: 3 }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//             <Typography
//               variant="h5"
//               sx={{
//                 fontWeight: 600,
//                 color: textColor,
//               }}
//             >
//               Filters
//             </Typography>
//             <IconButton
//               onClick={toggleFilterDrawer}
//               size="small"
//               sx={{
//                 borderRadius: '8px',
//                 backgroundColor: 'rgba(71, 118, 230, 0.1)',
//                 color: primaryColor,
//                 '&:hover': {
//                   backgroundColor: 'rgba(71, 118, 230, 0.2)',
//                 },
//               }}
//             >
//               <CloseIcon fontSize="small" />
//             </IconButton>
//           </Box>

//           <Divider sx={{ mb: 3, borderColor: 'rgba(0, 0, 0, 0.1)' }} />

//           <FormControl component="fieldset" fullWidth>
//             <FormGroup>
//               {filters.map((filter) => (
//                 <FormControlLabel
//                   key={filter}
//                   control={
//                     <Checkbox
//                       checked={selectedFilters[filter] || false}
//                       onChange={onFilterChange}
//                       name={filter}
//                       sx={{
//                         color: '#607080',
//                         '&.Mui-checked': {
//                           color: primaryColor,
//                         },
//                         '& .MuiSvgIcon-root': {
//                           fontSize: 22,
//                         },
//                       }}
//                     />
//                   }
//                   label={
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         color: selectedFilters[filter] ? textColor : '#607080',
//                         fontWeight: selectedFilters[filter] ? 500 : 400,
//                       }}
//                     >
//                       {filter}
//                     </Typography>
//                   }
//                   sx={{
//                     mb: 1.5,
//                     py: 0.5,
//                     px: 1,
//                     borderRadius: '8px',
//                     transition: 'all 0.2s ease',
//                     bgcolor: selectedFilters[filter] ? 'rgba(71, 118, 230, 0.08)' : 'transparent',
//                     '&:hover': {
//                       bgcolor: 'rgba(71, 118, 230, 0.05)',
//                     },
//                   }}
//                 />
//               ))}
//             </FormGroup>
//           </FormControl>

//           <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
//             <Button
//               variant="text"
//               onClick={clearFilters}
//               disabled={activeFiltersCount === 0}
//               sx={{
//                 textTransform: 'none',
//                 fontWeight: 500,
//                 color: '#607080',
//                 '&:hover': {
//                   color: textColor,
//                   backgroundColor: 'rgba(71, 118, 230, 0.05)',
//                 },
//                 '&.Mui-disabled': {
//                   color: 'rgba(96, 112, 128, 0.4)',
//                 },
//               }}
//             >
//               Clear All
//             </Button>
//             <Button
//               variant="contained"
//               onClick={toggleFilterDrawer}
//               sx={{
//                 background: primaryColor,
//                 boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
//                 borderRadius: '8px',
//                 px: 3,
//                 textTransform: 'none',
//                 fontWeight: 500,
//                 '&:hover': {
//                   boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
//                   background: primaryColor,
//                   transform: 'translateY(-2px)',
//                 },
//               }}
//             >
//               Apply Filters
//             </Button>
//           </Box>
//         </Box>
//       </Drawer>
//     </>
//   );
// }

"use client";
import React, { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Drawer,
  Divider,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Badge,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';

// Filters for Blogs page
const filters = ["My Clubs", "My Boards"];

export default function SearchBar({
  searchQuery,
  onSearchChange,
  selectedFilters = {},
  onFilterChange,
  clearFilters,
}) {
  const theme = useTheme();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  const activeFiltersCount = Object.values(selectedFilters).filter(Boolean).length;

  return (
    <>
      <Box
        sx={{
          mb: isSticky ? 16 : 3,
          position: 'relative',
          zIndex: 1100,
        }}
      >
        <Paper
          elevation={isSticky ? 4 : 0}
          sx={{
            borderRadius: '16px',
            bgcolor: theme.palette.background.paper,
            boxShadow: isSticky
              ? '0 6px 16px rgba(0, 0, 0, 0.1)'
              : '0 4px 12px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
            },
            position: isSticky ? 'fixed' : 'relative',
            top: isSticky ? 0 : 'auto',
            left: isSticky ? 0 : 'auto',
            right: isSticky ? 0 : 'auto',
            width: isSticky ? 'calc(100% - 32px)' : '100%',
            maxWidth: isSticky ? '1200px' : '100%',
            margin: isSticky ? '16px auto' : 0,
            transform: isSticky ? 'translateY(0)' : 'none',
            animation: isSticky ? 'slideDown 0.3s ease' : 'none',
            '@keyframes slideDown': {
              from: { transform: 'translateY(-100%)' },
              to: { transform: 'translateY(0)' },
            },
          }}
        >
          <Box sx={{ py: 0.5, px: 2, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.primary.main, opacity: 0.8 }} />
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: { 
                  fontSize: '0.95rem',
                  color: theme.palette.text.primary,
                  '&::placeholder': {
                    color: theme.palette.text.secondary,
                    opacity: 0.7,
                  },
                },
              }}
              sx={{ 
                maxWidth: '100%',
                '& .MuiInputBase-root': {
                  bgcolor: theme.palette.background.default,
                  borderRadius: '12px',
                  pl: 1,
                  height: 48,
                  transition: 'all 0.3s ease',
                  '&:hover, &:focus-within': {
                    bgcolor: theme.palette.action.hover,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  },
                },
              }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Button
              onClick={toggleFilterDrawer}
              startIcon={<TuneIcon />}
              variant={activeFiltersCount > 0 ? "contained" : "outlined"}
              size="medium"
              sx={{ 
                ml: 2,
                borderRadius: '8px', 
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                height: 40,
                ...(activeFiltersCount > 0 
                  ? {
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.4)',
                        bgcolor: theme.palette.primary.dark,
                      },
                    } 
                  : {
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        color: theme.palette.primary.dark,
                        bgcolor: theme.palette.action.hover,
                      },
                    }),
              }}
            >
              Filters
              {activeFiltersCount > 0 && (
                <Box
                  sx={{
                    ml: 1,
                    bgcolor: activeFiltersCount > 0 ? theme.palette.background.paper : theme.palette.primary.main,
                    color: activeFiltersCount > 0 ? theme.palette.primary.main : theme.palette.primary.contrastText,
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeFiltersCount}
                </Box>
              )}
            </Button>
          </Box>
        </Paper>
      </Box>

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        <Box sx={{ width: 320, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              Filters
            </Typography>
            <IconButton
              onClick={toggleFilterDrawer}
              size="small"
              sx={{
                borderRadius: '8px',
                bgcolor: theme.palette.action.hover,
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.action.selected,
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3, borderColor: theme.palette.divider }} />

          <FormControl component="fieldset" fullWidth>
            <FormGroup>
              {filters.map((filter) => (
                <FormControlLabel
                  key={filter}
                  control={
                    <Checkbox
                      checked={selectedFilters[filter] || false}
                      onChange={onFilterChange}
                      name={filter}
                      sx={{
                        color: theme.palette.text.secondary,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                        '& .MuiSvgIcon-root': {
                          fontSize: 22,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        color: selectedFilters[filter] ? theme.palette.text.primary : theme.palette.text.secondary,
                        fontWeight: selectedFilters[filter] ? 500 : 400,
                      }}
                    >
                      {filter}
                    </Typography>
                  }
                  sx={{
                    mb: 1.5,
                    py: 0.5,
                    px: 1,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    bgcolor: selectedFilters[filter] ? theme.palette.action.hover : 'transparent',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                />
              ))}
            </FormGroup>
          </FormControl>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="text"
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.action.hover,
                },
                '&.Mui-disabled': {
                  color: theme.palette.action.disabled,
                },
              }}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              onClick={toggleFilterDrawer}
              sx={{
                bgcolor: theme.palette.primary.main,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                px: 3,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.4)',
                  bgcolor: theme.palette.primary.dark,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}