import React, { useState, useEffect } from "react";
import {
  TextField,
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
  InputAdornment,
  IconButton,
  useTheme
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import { getAuthToken } from "@/utils/auth";

const EventsSearchBar = ({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  filters,
  clearFilters
}) => {
  const theme = useTheme();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
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

  if (!authToken) {
    return null;
  }

  return (
    <>
      <Box sx={{ 
        mb: isSticky ? 16 : 4,
        position: 'relative',
        zIndex: theme.zIndex.appBar,
      }}>
        <Paper 
          elevation={isSticky ? 4 : 0} 
          sx={{ 
            borderRadius: '16px',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[isSticky ? 4 : 1],
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            position: isSticky ? 'fixed' : 'relative',
            top: isSticky ? 0 : 'auto',
            left: isSticky ? 0 : 'auto',
            right: isSticky ? 0 : 'auto',
            width: isSticky ? 'calc(100% - 32px)' : '100%',
            maxWidth: isSticky ? '1200px' : '100%', 
            margin: isSticky ? '16px auto' : 0,
            '@keyframes slideDown': {
              from: { transform: 'translateY(-100%)' },
              to: { transform: 'translateY(0)' }
            },
            animation: isSticky ? 'slideDown 0.3s ease' : 'none',
          }}
        >
          <Box sx={{ py: 0.5, px: 2, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ 
                      color: theme.palette.primary.main, 
                      opacity: 0.8 
                    }} />
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: { 
                  fontSize: '0.95rem',
                  color: theme.palette.text.primary,
                }
              }}
              sx={{ 
                maxWidth: '100%',
                '& .MuiInputBase-root': {
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: '12px',
                  pl: 1,
                  height: 48,
                  transition: 'all 0.3s ease',
                  '&:hover, &:focus-within': {
                    backgroundColor: theme.palette.action.selected,
                  }
                }
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
                      background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      color: theme.palette.getContrastText(theme.palette.primary.main),
                      '&:hover': {
                        background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      }
                    } 
                  : {
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        color: theme.palette.primary.dark,
                        backgroundColor: theme.palette.action.hover
                      }
                    })
              }}
            >
              Filters
              {activeFiltersCount > 0 && (
                <Box
                  sx={{
                    ml: 1,
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.primary.main,
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <Box sx={{ width: 320, p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Filters
            </Typography>
            <IconButton 
              onClick={toggleFilterDrawer} 
              size="small"
              sx={{ 
                borderRadius: '8px',
                backgroundColor: theme.palette.action.selected,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Divider sx={{ 
            mb: 3, 
            borderColor: theme.palette.divider 
          }} />
          
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
                          fontSize: 22
                        } 
                      }}
                    />
                  }
                  label={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: selectedFilters[filter] 
                          ? theme.palette.text.primary 
                          : theme.palette.text.secondary,
                        fontWeight: selectedFilters[filter] ? 500 : 400
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
                    bgcolor: selectedFilters[filter] 
                      ? theme.palette.action.selected 
                      : 'transparent',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                />
              ))}
            </FormGroup>
          </FormControl>
          
          <Box sx={{ 
            mt: 4, 
            display: 'flex', 
            justifyContent: 'space-between' 
          }}>
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
                  backgroundColor: theme.palette.action.hover
                },
                '&.Mui-disabled': {
                  color: theme.palette.text.disabled
                }
              }}
            >
              Clear All
            </Button>
            <Button 
              variant="contained" 
              onClick={toggleFilterDrawer}
              sx={{ 
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                borderRadius: '8px',
                px: 3,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                }
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default EventsSearchBar;
