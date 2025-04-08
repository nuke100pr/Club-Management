import React from "react";
import {
  AppBar, 
  Toolbar, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Box, 
  Typography,
  useTheme,
  useMediaQuery
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onFilterToggle 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <AppBar 
      position="sticky"
      color="default" 
      elevation={0} 
      sx={{ 
        mb: 4, 
        bgcolor: 'transparent', 
        boxShadow: 'none',
        top: 0,
        zIndex: theme.zIndex.appBar
      }}
    >
      <Toolbar>
        <TextField
          fullWidth
          variant="standard"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ opacity: 0.6 }} />
              </InputAdornment>
            ),
            style: {
              height: '40px',
              fontSize: '0.95rem',
              paddingLeft: '4px',
            }
          }}
          sx={{ 
            maxWidth: 600,
            '& .MuiInputBase-root': {
              borderRadius: '24px',
              backgroundColor: '#f5f5f5',
              pl: 1,
              '&:hover': {
                backgroundColor: '#eeeeee',
                transition: 'background-color 0.3s'
              }
            },
            '& .MuiInputBase-input::placeholder': {
              opacity: 0.7
            }
          }}
        />
        
        <Box sx={{ flexGrow: 1 }} />
        
        <IconButton onClick={onFilterToggle}>
          <FilterListIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default SearchBar;