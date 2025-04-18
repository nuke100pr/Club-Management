"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  alpha,
  styled,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  AccessTime,
  LocationOn,
  Close,
  FilterList,
  CalendarMonth,
  ViewWeek,
  Today,
  Search as SearchIcon,
} from "@mui/icons-material";

// Custom styled components using theme
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: 8,
  transition: "all 0.3s ease",
  boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
  fontWeight: 500,
  textTransform: "none",
  "&:hover": {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
    boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
    transform: "translateY(-2px)",
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  overflow: "hidden",
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  padding: "16px 24px",
  color: theme.palette.text.primary,
  borderRadius: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  background: alpha(theme.palette.primary.main, 0.1),
  "&:hover": {
    background: alpha(theme.palette.primary.main, 0.2),
  },
  margin: "0 4px",
}));

const ViewButton = styled(Button)(({ active, theme }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  borderRadius: 8,
  background: active ? alpha(theme.palette.primary.main, 0.1) : "transparent",
  "&:hover": {
    background: active 
      ? alpha(theme.palette.primary.main, 0.15) 
      : alpha(theme.palette.primary.main, 0.05),
  },
  padding: "6px 12px",
  minWidth: "auto",
  marginLeft: 8,
  textTransform: "none",
  fontWeight: 500,
  border: active 
    ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` 
    : `1px solid ${theme.palette.divider}`,
}));

const DayCell = styled(Paper)(({ selected, isToday, theme }) => ({
  height: "100%",
  padding: 8,
  cursor: "pointer",
  overflow: "hidden",
  borderRadius: 8,
  background: theme.palette.background.paper,
  border: isToday 
    ? `2px solid ${theme.palette.primary.main}`
    : selected
    ? `1px solid ${alpha(theme.palette.primary.main, 0.5)}`
    : `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
    borderColor: alpha(theme.palette.primary.main, 0.5),
  },
}));

const EventChip = styled(Chip)(({ theme }) => ({
  height: "auto",
  padding: "4px 0",
  borderRadius: 6,
  fontWeight: 500,
  fontSize: "0.7rem",
  background: alpha(theme.palette.primary.main, 0.05),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  "& .MuiChip-label": {
    padding: "0 8px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    boxShadow: theme.shadows[1],
    transition: "all 0.3s ease",
    background: theme.palette.background.paper,
    "&:hover": {
      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    "&.Mui-focused": {
      boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.15)}`,
      borderColor: theme.palette.primary.main,
    },
  },
}));

const EventModal = ({ open, onClose, selectedDate, events }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DialogTitle sx={{ 
        p: 0, 
        position: "relative",
        overflow: "hidden",
      }}>
        <Box sx={{ 
          background: theme.palette.background.paper,
          p: 2,
          color: theme.palette.text.primary,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="h6" fontWeight={600}>
            {selectedDate?.month} {selectedDate?.day}, {selectedDate?.year}
          </Typography>
          <IconButton 
            edge="end" 
            onClick={onClose} 
            aria-label="close"
            sx={{ 
              color: theme.palette.text.secondary,
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2, background: theme.palette.background.default }}>
        {events.length > 0 ? (
          <Stack spacing={2}>
            {events.map((event) => (
              <Paper
                key={event._id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: theme.palette.background.paper,
                  borderLeft: `3px solid ${theme.palette.primary.main}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                  }
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} color={theme.palette.text.primary}>
                  {event.name}
                </Typography>
                <Stack spacing={1.5} mt={1.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTime 
                      fontSize="small" 
                      sx={{ color: theme.palette.primary.main }}
                    />
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                      {new Date(event.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - Duration: {event.duration}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOn 
                      fontSize="small" 
                      sx={{ color: theme.palette.primary.main }}
                    />
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                      {event.venue}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography 
                    variant="body2" 
                    color={theme.palette.text.secondary}
                    sx={{ mt: 1, lineHeight: 1.6 }}
                  >
                    {event.description}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color={theme.palette.text.secondary}>
              No events scheduled for this day
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, background: theme.palette.background.paper, justifyContent: "center" }}>
        <GradientButton onClick={onClose} sx={{ px: 4 }}>
          Close
        </GradientButton>
      </DialogActions>
    </Dialog>
  );
};

// Main Calendar Component
const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentView, setCurrentView] = useState("month");
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter states
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [eventType, setEventType] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Today's date for highlighting
  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events`);
        const result = await response.json();
        
        if (result.success) {
          setEvents(result.data);
        } else {
          setError("Failed to fetch events");
        }
      } catch (err) {
        setError("Error connecting to the server");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Calculate actual weeks needed for the month to avoid unnecessary empty rows
  const totalDaysDisplayed = daysInMonth + firstDayOfMonth;
  const weeksNeeded = Math.ceil(totalDaysDisplayed / 7);

  const calendarDays = Array.from({ length: weeksNeeded * 7 }, (_, i) => {
    const day = i - firstDayOfMonth + 1;
    if (day <= 0 || day > daysInMonth) return null;
    return day;
  });

  // Create array of days for the week view
  const createWeekDays = () => {
    const now = new Date(currentYear, currentMonth, selectedDay);
    const day = now.getDay(); // 0-6, Sunday is 0
    const weekDays = [];

    // Calculate the start of the week (Sunday)
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - day);

    // Create 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      weekDays.push({
        day: currentDate.getDate(),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        isCurrentMonth: currentDate.getMonth() === currentMonth,
      });
    }

    return weekDays;
  };

  const weekDays = createWeekDays();

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };

  const handleResetFilters = () => {
    setSelectedClub(null);
    setSelectedBoard(null);
    setEventType(null);
  };

  // Transform API events to a format we can use with our calendar
  const transformEvents = (events) => {
    return events.map(event => {
      const date = new Date(event.timestamp);
      return {
        ...event,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });
  };

  const transformedEvents = transformEvents(events);

  // Filter events based on selected criteria
  const filteredEvents = transformedEvents.filter(
    (event) =>
      (event.name?.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase()) ||
        search === "") &&
      (!selectedClub || event.club_id === selectedClub) &&
      (!selectedBoard || event.board_id === selectedBoard) &&
      (!eventType || event.event_type_id === eventType)
  );

  // Get events for a specific day with filters applied
  const getEventsForDay = (day, month = currentMonth, year = currentYear) => {
    return filteredEvents.filter(
      (event) =>
        event.day === day && event.month === month && event.year === year
    );
  };

  const handleDayClick = (day) => {
    if (day) {
      setSelectedDay(day);
      setSelectedDate({
        day,
        month: months[currentMonth],
        year: currentYear,
      });

      if (currentView === "day") {
        // For day view, update the selected day but don't open modal
        setSelectedDay(day);
      } else {
        // For other views, open the modal with events
        setIsModalOpen(true);
      }
    }
  };

  const handlePrev = () => {
    if (currentView === "month") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (currentView === "week") {
      // Move back one week
      const newDate = new Date(currentYear, currentMonth, selectedDay - 7);
      setSelectedDay(newDate.getDate());
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
    } else if (currentView === "day") {
      // Move back one day
      const newDate = new Date(currentYear, currentMonth, selectedDay - 1);
      setSelectedDay(newDate.getDate());
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
    }
  };

  const handleNext = () => {
    if (currentView === "month") {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (currentView === "week") {
      // Move forward one week
      const newDate = new Date(currentYear, currentMonth, selectedDay + 7);
      setSelectedDay(newDate.getDate());
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
    } else if (currentView === "day") {
      // Move forward one day
      const newDate = new Date(currentYear, currentMonth, selectedDay + 1);
      setSelectedDay(newDate.getDate());
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
    }
  };

  const handleViewChange = (newView) => {
    if (newView !== null) {
      setCurrentView(newView);
    }
  };

  // Get upcoming events
  const getUpcomingEvents = () => {
    const today = new Date();
    
    return filteredEvents
      .filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= today;
      })
      .sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
      })
      .slice(0, 5);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case "Workshop":
        return "primary";
      case "Meeting":
        return "success";
      case "Competition":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Calculate appropriate cell height based on available space and number of weeks
  const calculateDayCellHeight = () => {
    if (currentView === "day") return "auto";
    if (isSmall) return 80;
    if (isMobile) return 90;

    // Adjust height based on weeks needed
    return weeksNeeded <= 5 ? 120 : 100;
  };

  const dayCellHeight = calculateDayCellHeight();

  // Get title based on current view
  const getViewTitle = () => {
    if (currentView === "month") {
      return `${months[currentMonth]} ${currentYear}`;
    } else if (currentView === "week") {
      const firstDay = weekDays[0];
      const lastDay = weekDays[6];

      if (firstDay.month === lastDay.month) {
        return `${months[firstDay.month]} ${firstDay.day} - ${lastDay.day}, ${
          firstDay.year
        }`;
      } else {
        return `${months[firstDay.month]} ${firstDay.day} - ${
          months[lastDay.month]
        } ${lastDay.day}, ${firstDay.year}`;
      }
    } else if (currentView === "day") {
      return `${months[currentMonth]} ${selectedDay}, ${currentYear}`;
    }
  };

  const renderMonthView = () => (
    <Grid container spacing={1}>
      {calendarDays.map((day, index) => (
        <Grid item xs={12 / 7} key={index} sx={{ height: dayCellHeight }}>
          {day ? (
            <DayCell
              selected={day === selectedDay}
              isToday={isToday(day)}
              onClick={() => handleDayClick(day)}
              sx={{ height: "100%" }}
            >
              <Typography
                variant={isSmall ? "caption" : "body2"}
                fontWeight={500}
                mb={1}
                color={isToday(day) ? theme.palette.primary.main : theme.palette.text.primary}
                sx={{
                  display: "inline-block",
                  width: 24,
                  height: 24,
                  textAlign: "center",
                  lineHeight: "24px",
                  borderRadius: "50%",
                  background: isToday(day) 
                    ? alpha(theme.palette.primary.main, 0.1) 
                    : "transparent",
                }}
              >
                {day}
              </Typography>
              <Stack spacing={0.7}>
                {getEventsForDay(day)
                  .slice(0, isSmall ? 1 : isMobile ? 2 : 3)
                  .map((event) => (
                    <EventChip
                      key={event._id}
                      label={isSmall ? "" : event.name}
                      size="small"
                      color={getEventTypeColor(event.event_type_id)}
                      icon={isSmall ? <AccessTime fontSize="small" /> : null}
                    />
                  ))}
                {getEventsForDay(day).length >
                  (isSmall ? 1 : isMobile ? 2 : 3) && (
                  <Typography 
                    variant="caption" 
                    color={theme.palette.text.secondary}
                    sx={{ 
                      display: "inline-block", 
                      background: alpha(theme.palette.primary.main, 0.05), 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      fontSize: "0.65rem",
                    }}
                  >
                    +
                    {getEventsForDay(day).length -
                      (isSmall ? 1 : isMobile ? 2 : 3)}{" "}
                    more
                  </Typography>
                )}
              </Stack>
            </DayCell>
          ) : (
            <Box
              sx={{
                height: "100%",
                borderRadius: 2,
                background: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
          )}
        </Grid>
      ))}
    </Grid>
  );

  const renderWeekView = () => (
    <Grid container spacing={1}>
      {weekDays.map((dayInfo, index) => (
        <Grid item xs={12 / 7} key={index}>
          <Paper
            elevation={0}
            sx={{
              height: isMobile ? 150 : 180,
              p: 2,
              cursor: "pointer",
              borderRadius: 2,
              overflow: "hidden",
              background: theme.palette.background.paper,
              border: index === 0 
                ? `2px solid ${theme.palette.primary.main}`
                : `1px solid ${theme.palette.divider}`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
              },
            }}
            onClick={() => {
              setSelectedDay(dayInfo.day);
              if (dayInfo.month !== currentMonth) {
                setCurrentMonth(dayInfo.month);
                setCurrentYear(dayInfo.year);
              }
              setIsModalOpen(true);
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography 
                  variant="caption" 
                  color={theme.palette.text.secondary}
                  fontWeight={500}
                >
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][index]}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color={
                    dayInfo.day === today.getDate() && 
                    dayInfo.month === today.getMonth() && 
                    dayInfo.year === today.getFullYear() 
                      ? theme.palette.primary.main 
                      : dayInfo.isCurrentMonth 
                        ? theme.palette.text.primary 
                        : theme.palette.text.secondary
                  }
                  sx={{
                    mt: 0.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: 
                      dayInfo.day === today.getDate() && 
                      dayInfo.month === today.getMonth() && 
                      dayInfo.year === today.getFullYear() 
                        ? alpha(theme.palette.primary.main, 0.1) 
                        : "transparent"
                  }}
                >
                  {dayInfo.day}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Stack spacing={1} sx={{ mt: 2 }}>
              {getEventsForDay(dayInfo.day, dayInfo.month, dayInfo.year)
                .slice(0, 3)
                .map((event) => (
                <Box
                  key={event._id}
                  sx={{
                    p: 1,
                    fontSize: "0.75rem",
                    borderRadius: 2,
                    background: alpha(theme.palette.primary.main, 0.05),
                    color: theme.palette.primary.main,
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: 500,
                  }}
                >
                  {event.name}
                </Box>
              ))}
              {getEventsForDay(dayInfo.day, dayInfo.month, dayInfo.year).length > 3 && (
                <Typography 
                  variant="caption" 
                  color={theme.palette.text.secondary}
                  sx={{ 
                    textAlign: "center", 
                    display: "block", 
                    background: alpha(theme.palette.primary.main, 0.05), 
                    p: 0.5, 
                    borderRadius: 1 
                  }}
                >
                  + {getEventsForDay(dayInfo.day, dayInfo.month, dayInfo.year).length - 3} more
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const renderDayView = () => {
    const dayEvents = getEventsForDay(selectedDay);

    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 3,
            background: theme.palette.background.paper,
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.05)}`,
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1,
            }}
          >
            {months[currentMonth]} {selectedDay}, {currentYear}
          </Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"} scheduled
          </Typography>
        </Paper>

        {dayEvents.length > 0 ? (
          <Stack spacing={2}>
            {dayEvents.map((event) => (
              <Paper
                key={event._id}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: theme.palette.background.paper,
                  boxShadow: theme.shadows[1],
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                  }
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Typography variant="h6" fontWeight={600} color={theme.palette.text.primary}>
                    {event.name}
                  </Typography>
                  <Chip 
                    label={event.event_type_id} 
                    size="small"
                    sx={{
                      borderRadius: 6,
                      background: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      py: 0.5,
                    }}
                  />
                </Box>
                <Stack spacing={1.5} mt={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTime 
                      fontSize="small" 
                      sx={{ color: theme.palette.primary.main }}
                    />
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                      {event.time} - Duration: {event.duration}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOn 
                      fontSize="small" 
                      sx={{ color: theme.palette.primary.main }}
                    />
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                      {event.venue}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography 
                    variant="body2" 
                    color={theme.palette.text.secondary}
                    sx={{ mt: 1, lineHeight: 1.6 }}
                  >
                    {event.description}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography color={theme.palette.text.secondary} variant="h6">
              No events scheduled for this day
            </Typography>
            <Typography color={theme.palette.text.secondary} variant="body2" sx={{ mt: 1 }}>
              Select a different day or create a new event
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderFilterPanel = () => (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        mb: 3,
        background: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600} color={theme.palette.text.primary}>
          Filters
        </Typography>
        <Button 
          variant="text" 
          color="primary" 
          onClick={handleResetFilters}
          sx={{ textTransform: "none", color: theme.palette.primary.main }}
        >
          Reset
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <Typography variant="body2" fontWeight={500} color={theme.palette.text.secondary} gutterBottom>
              Club
            </Typography>
            <RadioGroup
              value={selectedClub || ""}
              onChange={(e) => setSelectedClub(e.target.value !== "" ? e.target.value : null)}
            >
              <FormControlLabel 
                value="IEEE" 
                control={<Radio color="primary" />} 
                label="IEEE" 
              />
              <FormControlLabel 
                value="ACM" 
                control={<Radio color="primary" />} 
                label="ACM" 
              />
              <FormControlLabel 
                value="GDSC" 
                control={<Radio color="primary" />} 
                label="GDSC" 
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <Typography variant="body2" fontWeight={500} color={theme.palette.text.secondary} gutterBottom>
              Board
            </Typography>
            <RadioGroup
              value={selectedBoard || ""}
              onChange={(e) => setSelectedBoard(e.target.value !== "" ? e.target.value : null)}
            >
              <FormControlLabel 
                value="PR" 
                control={<Radio color="primary" />} 
                label="PR Board" 
              />
              <FormControlLabel 
                value="Technical" 
                control={<Radio color="primary" />} 
                label="Technical Board" 
              />
              <FormControlLabel 
                value="HR" 
                control={<Radio color="primary" />} 
                label="HR Board" 
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <Typography variant="body2" fontWeight={500} color={theme.palette.text.secondary} gutterBottom>
              Event Type
            </Typography>
            <RadioGroup
              value={eventType || ""}
              onChange={(e) => setEventType(e.target.value !== "" ? e.target.value : null)}
            >
              <FormControlLabel 
                value="Workshop" 
                control={<Radio color="primary" />} 
                label="Workshop" 
              />
              <FormControlLabel 
                value="Meeting" 
                control={<Radio color="primary" />} 
                label="Meeting" 
              />
              <FormControlLabel 
                value="Competition" 
                control={<Radio color="primary" />} 
                label="Competition" 
              />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: theme.palette.background.default, minHeight: "100vh" }}>
      <StyledHeader>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Event Calendar
          </Typography>
          <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5 }}>
            {getViewTitle()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ display: { xs: 'none', md: 'flex' }}}>
            <ViewButton
              active={currentView === "month"}
              onClick={() => handleViewChange("month")}
              startIcon={<ViewWeek />}
            >
              Month
            </ViewButton>
            <ViewButton
              active={currentView === "week"}
              onClick={() => handleViewChange("week")}
              startIcon={<CalendarMonth />}
            >
              Week
            </ViewButton>
            <ViewButton
              active={currentView === "day"}
              onClick={() => handleViewChange("day")}
              startIcon={<Today />}
            >
              Day
            </ViewButton>
          </Box>
          <StyledIconButton onClick={handlePrev} size="small">
            <ChevronLeft />
          </StyledIconButton>
          <StyledIconButton onClick={handleNext} size="small">
            <ChevronRight />
          </StyledIconButton>
        </Box>
      </StyledHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={currentView === "day" ? 8 : 9}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}>
                <ViewButton
                  active={currentView === "month"}
                  onClick={() => handleViewChange("month")}
                  startIcon={<ViewWeek />}
                >
                  Month
                </ViewButton>
                <ViewButton
                  active={currentView === "week"}
                  onClick={() => handleViewChange("week")}
                  startIcon={<CalendarMonth />}
                >
                  Week
                </ViewButton>
                <ViewButton
                  active={currentView === "day"}
                  onClick={() => handleViewChange("day")}
                  startIcon={<Today />}
                >
                  Day
                </ViewButton>
              </Box>
              <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <SearchField
                  placeholder="Search events..."
                  variant="outlined"
                  fullWidth
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
                  }}
                  size="small"
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleFilterToggle}
                    startIcon={<FilterList />}
                    sx={{
                      borderRadius: 2,
                      whiteSpace: "nowrap",
                      display: { xs: "none", md: "flex" },
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      color: theme.palette.primary.main,
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        background: alpha(theme.palette.primary.main, 0.05),
                      }
                    }}
                  >
                    Filters
                  </Button>
                  <IconButton 
                    onClick={handleFilterToggle}
                    sx={{ 
                      display: { xs: "flex", md: "none" },
                      background: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      "&:hover": {
                        background: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <FilterList />
                  </IconButton>
                </Box>
              </Box>
  
              {filterOpen && renderFilterPanel()}
  
              {currentView === "month" && renderMonthView()}
              {currentView === "week" && renderWeekView()}
              {currentView === "day" && renderDayView()}
            </Box>
          </Grid>
  
          <Grid item xs={12} lg={currentView === "day" ? 4 : 3}>
            <StyledCard>
              <Box
                sx={{
                  p: 3,
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  borderRadius: "12px 12px 0 0",
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Upcoming Events
                </Typography>
                <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5 }}>
                  Next 5 events on your calendar
                </Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                {getUpcomingEvents().length > 0 ? (
                  <Stack divider={<Divider sx={{ borderColor: theme.palette.divider }} />}>
                    {getUpcomingEvents().map((event) => (
                      <Box 
                        key={event._id} 
                        sx={{ 
                          p: 2,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: alpha(theme.palette.primary.main, 0.03),
                          }
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography variant="subtitle2" fontWeight={600} color={theme.palette.text.primary}>
                            {event.name}
                          </Typography>
                          <Chip
                            label={event.event_type_id}
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: "0.6rem",
                              fontWeight: 500,
                              background: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                          <CalendarMonth 
                            fontSize="small" 
                            sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 16 }}
                          />
                          <Typography variant="caption" color={theme.palette.text.secondary}>
                            {months[event.month]} {event.day}, {event.year}
                          </Typography>
                          <Box sx={{ mx: 1, color: theme.palette.divider }}>•</Box>
                          <AccessTime 
                            fontSize="small" 
                            sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 16 }}
                          />
                          <Typography variant="caption" color={theme.palette.text.secondary}>
                            {event.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography color={theme.palette.text.secondary}>
                      No upcoming events
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
  
        {isModalOpen && (
          <EventModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selectedDate={selectedDate}
            events={getEventsForDay(selectedDay)}
          />
        )}
      </Box>
    );
  };
  
  export default CalendarView;