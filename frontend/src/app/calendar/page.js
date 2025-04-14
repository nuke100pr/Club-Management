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

// Color definitions
const mainColor = "#4776E6";
const lightColor = "#6a98ff";
const darkColor = "#3a5fc0";

// Custom styled components
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${mainColor} 30%, ${lightColor} 90%)`,
  color: "white",
  borderRadius: 8,
  transition: "all 0.3s ease",
  boxShadow: `0 4px 10px ${alpha(mainColor, 0.3)}`,
  fontWeight: 500,
  textTransform: "none",
  "&:hover": {
    background: `linear-gradient(45deg, ${darkColor} 30%, ${mainColor} 90%)`,
    boxShadow: `0 6px 15px ${alpha(mainColor, 0.4)}`,
    transform: "translateY(-2px)",
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  background: "white",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  overflow: "hidden",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  background: "white",
  padding: "16px 24px",
  color: "#2A3B4F",
  borderRadius: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: `1px solid rgba(0, 0, 0, 0.08)`,
  marginBottom: theme.spacing(2),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: mainColor,
  background: alpha(mainColor, 0.1),
  "&:hover": {
    background: alpha(mainColor, 0.2),
  },
  margin: "0 4px",
}));

const ViewButton = styled(Button)(({ active, theme }) => ({
  color: active ? mainColor : "#607080",
  borderRadius: 8,
  background: active ? alpha(mainColor, 0.1) : "transparent",
  "&:hover": {
    background: active ? alpha(mainColor, 0.15) : alpha(mainColor, 0.05),
  },
  padding: "6px 12px",
  minWidth: "auto",
  marginLeft: 8,
  textTransform: "none",
  fontWeight: 500,
  border: active ? `1px solid ${alpha(mainColor, 0.3)}` : "1px solid rgba(0, 0, 0, 0.08)",
}));

const DayCell = styled(Paper)(({ selected, isToday, theme }) => ({
  height: "100%",
  padding: 8,
  cursor: "pointer",
  overflow: "hidden",
  borderRadius: 8,
  background: "white",
  border: isToday 
    ? `2px solid ${mainColor}`
    : selected
    ? `1px solid ${alpha(mainColor, 0.5)}`
    : "1px solid rgba(0, 0, 0, 0.08)",
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: `0 4px 8px ${alpha(mainColor, 0.1)}`,
    borderColor: alpha(mainColor, 0.5),
  },
}));

const EventChip = styled(Chip)(({ color, theme }) => ({
  height: "auto",
  padding: "4px 0",
  borderRadius: 6,
  fontWeight: 500,
  fontSize: "0.7rem",
  background: alpha(mainColor, 0.05),
  color: mainColor,
  border: `1px solid ${alpha(mainColor, 0.1)}`,
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
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
    background: "white",
    "&:hover": {
      boxShadow: `0 2px 8px ${alpha(mainColor, 0.1)}`,
    },
    "&.Mui-focused": {
      boxShadow: `0 2px 10px ${alpha(mainColor, 0.15)}`,
      borderColor: mainColor,
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
          border: `1px solid rgba(0, 0, 0, 0.08)`,
        },
      }}
    >
      <DialogTitle sx={{ 
        p: 0, 
        position: "relative",
        overflow: "hidden",
      }}>
        <Box sx={{ 
          background: "white",
          p: 2,
          color: "#2A3B4F",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid rgba(0, 0, 0, 0.08)`,
        }}>
          <Typography variant="h6" fontWeight={600}>
            {selectedDate?.month} {selectedDate?.day}, {selectedDate?.year}
          </Typography>
          <IconButton 
            edge="end" 
            onClick={onClose} 
            aria-label="close"
            sx={{ 
              color: "#607080",
              "&:hover": {
                background: alpha(mainColor, 0.1),
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2, background: "#f9fafc" }}>
        {events.length > 0 ? (
          <Stack spacing={2}>
            {events.map((event) => (
              <Paper
                key={event._id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "white",
                  borderLeft: `3px solid ${mainColor}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: `0 4px 12px ${alpha(mainColor, 0.1)}`,
                  }
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} color="#2A3B4F">
                  {event.name}
                </Typography>
                <Stack spacing={1.5} mt={1.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTime 
                      fontSize="small" 
                      sx={{ color: mainColor }}
                    />
                    <Typography variant="body2" color="#607080">
                      {new Date(event.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - Duration: {event.duration}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOn 
                      fontSize="small" 
                      sx={{ color: mainColor }}
                    />
                    <Typography variant="body2" color="#607080">
                      {event.venue}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography 
                    variant="body2" 
                    color="#607080"
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
            <Typography color="#607080">
              No events scheduled for this day
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, background: "white", justifyContent: "center" }}>
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
                color={isToday(day) ? mainColor : "#2A3B4F"}
                sx={{
                  display: "inline-block",
                  width: 24,
                  height: 24,
                  textAlign: "center",
                  lineHeight: "24px",
                  borderRadius: "50%",
                  background: isToday(day) ? alpha(mainColor, 0.1) : "transparent",
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
                    color="#607080"
                    sx={{ 
                      display: "inline-block", 
                      background: alpha(mainColor, 0.05), 
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
                background: "#f9fafc",
                border: "1px solid rgba(0, 0, 0, 0.04)",
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
              background: "white",
              border: index === 0 
                ? `2px solid ${mainColor}`
                : "1px solid rgba(0, 0, 0, 0.08)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: `0 4px 12px ${alpha(mainColor, 0.1)}`,
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
                  color="#607080"
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
                      ? mainColor 
                      : dayInfo.isCurrentMonth ? "#2A3B4F" : "#607080"
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
                        ? alpha(mainColor, 0.1) 
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
                    background: alpha(mainColor, 0.05),
                    color: mainColor,
                    borderLeft: `3px solid ${mainColor}`,
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
                  color="#607080"
                  sx={{ 
                    textAlign: "center", 
                    display: "block", 
                    background: alpha(mainColor, 0.05), 
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
            background: "white",
            borderLeft: `4px solid ${mainColor}`,
            boxShadow: `0 2px 8px ${alpha(mainColor, 0.05)}`,
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: "#2A3B4F",
              mb: 1,
            }}
          >
            {months[currentMonth]} {selectedDay}, {currentYear}
          </Typography>
          <Typography variant="body2" color="#607080">
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
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  borderLeft: `4px solid ${mainColor}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: `0 4px 12px ${alpha(mainColor, 0.1)}`,
                  }
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Typography variant="h6" fontWeight={600} color="#2A3B4F">
                    {event.name}
                  </Typography>
                  <Chip 
                    label={event.event_type_id} 
                    size="small"
                    sx={{
                      borderRadius: 6,
                      background: alpha(mainColor, 0.1),
                      color: mainColor,
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
                      sx={{ color: mainColor }}
                    />
                    <Typography variant="body2" color="#607080">
                      {event.time} - Duration: {event.duration}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOn 
                      fontSize="small" 
                      sx={{ color: mainColor }}
                    />
                    <Typography variant="body2" color="#607080">
                      {event.venue}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography 
                    variant="body2" 
                    color="#607080"
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
            <Typography color="#607080" variant="h6">
              No events scheduled for this day
            </Typography>
            <Typography color="#607080" variant="body2" sx={{ mt: 1 }}>
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
        background: "white",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600} color="#2A3B4F">
          Filters
        </Typography>
        <Button 
          variant="text" 
          color="primary" 
          onClick={handleResetFilters}
          sx={{ textTransform: "none", color: mainColor }}
        >
          Reset
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <Typography variant="body2" fontWeight={500} color="#607080" gutterBottom>
              Club
            </Typography>
            <RadioGroup
              value={selectedClub || ""}
              onChange={(e) => setSelectedClub(e.target.value !== "" ? e.target.value : null)}
            >
              <FormControlLabel 
                value="IEEE" 
                control={<Radio sx={{ color: mainColor }} />} 
                label="IEEE" 
              />
              <FormControlLabel 
                value="ACM" 
                control={<Radio sx={{ color: mainColor }} />} 
                label="ACM" 
              />
              <FormControlLabel 
                value="GDSC" 
                control={<Radio sx={{ color: mainColor }} />} 
                label="GDSC" 
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <Typography variant="body2" fontWeight={500} color="#607080" gutterBottom>
              Board
            </Typography>
            <RadioGroup
              value={selectedBoard || ""}
              onChange={(e) => setSelectedBoard(e.target.value !== "" ? e.target.value : null)}
            >
              <FormControlLabel 
                value="PR" 
                control={<Radio sx={{ color: mainColor }} />} 
                label="PR Board" 
              />
              <FormControlLabel 
                value="Technical" 
                control={<Radio sx={{ color: mainColor }} />} 
                label="Technical Board" 
              />
              <FormControlLabel 
                value="HR" 
                control={<Radio sx={{ color: mainColor }} />} 
                label="HR Board" 
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <Typography variant="body2" fontWeight={500} color="#607080" gutterBottom>
              Event Type
            </Typography>
            <RadioGroup
              value={eventType || ""}
              onChange={(e) => setEventType(e.target.value !== "" ? e.target.value : null)}
            >
              <FormControlLabel 
                value="Workshop" 
                control={<Radio sx={{ color: mainColor }} />} 
                label="Workshop" 
              />
              <FormControlLabel 
                value="Meeting" 
                control={<Radio sx={{ color: mainColor }} />} 
                label="Meeting" 
              />
              <FormControlLabel 
                value="Competition" 
                control={<Radio sx={{ color: mainColor }} />} 
                label="Competition" 
              />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "#f9fafc", minHeight: "100vh" }}>
      <StyledHeader>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Event Calendar
          </Typography>
          <Typography variant="body2" color="#607080" sx={{ mt: 0.5 }}>
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
                    startAdornment: <SearchIcon sx={{ mr: 1, color: mainColor }} />,
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
                      borderColor: alpha(mainColor, 0.3),
                      color: mainColor,
                      "&:hover": {
                        borderColor: mainColor,
                        background: alpha(mainColor, 0.05),
                      }
                    }}
                  >
                    Filters
                  </Button>
                  <IconButton 
                    onClick={handleFilterToggle}
                    sx={{ 
                      display: { xs: "flex", md: "none" },
                      background: alpha(mainColor, 0.1),
                      color: mainColor,
                      "&:hover": {
                        background: alpha(mainColor, 0.2),
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
                  background: "white",
                  color: "#2A3B4F",
                  borderRadius: "12px 12px 0 0",
                  borderBottom: `1px solid rgba(0, 0, 0, 0.08)`,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Upcoming Events
                </Typography>
                <Typography variant="body2" color="#607080" sx={{ mt: 0.5 }}>
                  Next 5 events on your calendar
                </Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                {getUpcomingEvents().length > 0 ? (
                  <Stack divider={<Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />}>
                    {getUpcomingEvents().map((event) => (
                      <Box 
                        key={event._id} 
                        sx={{ 
                          p: 2,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: alpha(mainColor, 0.03),
                          }
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography variant="subtitle2" fontWeight={600} color="#2A3B4F">
                            {event.name}
                          </Typography>
                          <Chip
                            label={event.event_type_id}
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: "0.6rem",
                              fontWeight: 500,
                              background: alpha(mainColor, 0.1),
                              color: mainColor,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                          <CalendarMonth 
                            fontSize="small" 
                            sx={{ color: mainColor, mr: 1, fontSize: 16 }}
                          />
                          <Typography variant="caption" color="#607080">
                            {months[event.month]} {event.day}, {event.year}
                          </Typography>
                          <Box sx={{ mx: 1, color: "#C0C8D0" }}>•</Box>
                          <AccessTime 
                            fontSize="small" 
                            sx={{ color: mainColor, mr: 1, fontSize: 16 }}
                          />
                          <Typography variant="caption" color="#607080">
                            {event.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography color="#607080">
                      No upcoming events
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <Box sx={{ p: 3, mt: "auto" }}>
                <GradientButton fullWidth>
                  Create New Event
                </GradientButton>
              </Box>
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