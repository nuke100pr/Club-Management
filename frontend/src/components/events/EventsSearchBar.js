import React from "react";
import {
  AppBar,
  Toolbar,
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
  Checkbox
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

const EventsSearchBar = ({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  filters,
  clearFilters
}) => {
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);

  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  const activeFiltersCount = Object.values(selectedFilters).filter(Boolean).length;

  return (
    <>
      <AppBar 
        position="static" 
        color="transparent" 
        elevation={0} 
        sx={{ 
          mb: 4, 
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar sx={{ py: 0.5 }}>

          
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" sx={{ opacity: 0.6 }} />
                </InputAdornment>
              ),
              disableUnderline: true,
              sx: { 
                fontSize: '0.95rem',
                '&::placeholder': {
                  opacity: 0.7
                }
              }
            }}
            sx={{ 
              maxWidth: 600,
              '& .MuiInputBase-root': {
                backgroundColor: '#f5f5f5',
                borderRadius: '24px',
                pl: 1,
                height: 40,
                transition: 'background-color 0.3s',
                '&:hover': {
                  backgroundColor: '#eeeeee'
                }
              }
            }}
          />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton 
            onClick={toggleFilterDrawer}
            color={activeFiltersCount > 0 ? "primary" : "default"}
            sx={{ 
              borderRadius: '50%', 
              p: 1,
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <FilterListIcon />
            {activeFiltersCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {activeFiltersCount}
              </Box>
            )}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
          }
        }}
      >
        <Box sx={{ width: 280, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>Filters</Typography>
            <IconButton 
              onClick={toggleFilterDrawer} 
              size="small"
              sx={{ 
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
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
                        '& .MuiSvgIcon-root': { 
                          fontSize: 20 
                        } 
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">{filter}</Typography>
                  }
                  sx={{ mb: 1 }}
                />
              ))}
            </FormGroup>
          </FormControl>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="text" 
              size="small" 
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Clear All
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              onClick={toggleFilterDrawer}
              sx={{ 
                boxShadow: 'none',
                borderRadius: '20px',
                px: 3,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default EventsSearchBar;