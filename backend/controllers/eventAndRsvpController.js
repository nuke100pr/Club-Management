const {
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEvents,
  addEventCoordinator,
  getEventCoordinators,
  removeEventCoordinator,
  createEventType,
  getAllEventTypes,
  updateEventType,
  deleteEventType,
  createRSVP,
  getRSVPsForEvent,
  getUserRSVPs,
  deleteRSVP,
} = require("../services/eventAndRsvpService");

const { isValidObjectId } = require("mongoose");
const ClubFollow = require("../models/ClubFollow");
const BoardFollow = require("../models/BoardFollow");
const Club = require("../models/Clubs");
const Board = require("../models/Boards");
const User = require("../models/User");
const Event = require("../models/Event");
const notificationService = require("../services/notificationService");
const RSVP = require("../models/RSVP");

// Event Controllers
const createEventController = async (req, res) => {
  try {
    const eventData = req.body;
    const imageFile = req.file;
    const newEvent = await createEvent(eventData, imageFile);

    const users = await User.find({}, "_id");
    const ids = users.map((user) => user._id.toString());
    notificationService.sendNotification(ids, "avva", "dvad", "avad", "avad");
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getEventByIdController = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const updateEventController = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;
    const imageFile = req.file;

    const updatedEvent = await updateEvent(eventId, updateData, imageFile);

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteEventController = async (req, res) => {
  try {
    await deleteEvent(req.params.id);
    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// controllers/eventAndRsvpController.js
const getAllEventsController = async (req, res) => {
  try {
    const userId = req.query.userId;
    const { board_id, club_id } = req.query;

    // Create base query with optional board_id/club_id filters
    let query = {};
    if (board_id && isValidObjectId(board_id)) {
      query.board_id = board_id;
    }
    if (club_id && isValidObjectId(club_id)) {
      query.club_id = club_id;
    }

    let events = await Event.find(query)
      .sort({ timestamp: -1 })
      .populate("image")
      .lean();

    await Promise.all(
      events.map(async (event) => {
        if (event.club_id && isValidObjectId(event.club_id)) {
          event.club_id = await Club.findById(event.club_id).lean();
        }
        if (event.board_id && isValidObjectId(event.board_id)) {
          event.board_id = await Board.findById(event.board_id).lean();
        }
      })
    );

    // If userId provided, fetch user-specific data
    if (userId) {
      const [userRSVPs, userClubFollows, userBoardFollows] = await Promise.all([
        RSVP.find({ user_id: userId }),
        ClubFollow.find({ user_id: userId }),
        BoardFollow.find({ user_id: userId }),
      ]);

      const rsvpMap = new Map(
        userRSVPs.map((rsvp) => [rsvp.event_id.toString(), true])
      );
      const clubFollowMap = new Map(
        userClubFollows.map((follow) => [follow.club_id.toString(), true])
      );
      const boardFollowMap = new Map(
        userBoardFollows.map((follow) => [follow.board_id.toString(), true])
      );

      events = events.map((event) => ({
        ...event,
        registered: rsvpMap.has(event?._id?.toString()),
        isClubFollowed: event?.club_id
          ? clubFollowMap.has(event?.club_id?._id?.toString())
          : false,
        isBoardFollowed: event?.board_id
          ? boardFollowMap.has(event?.board_id?._id?.toString())
          : false,
      }));
    }

    // Apply date filters if provided
    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate);
      events = events.filter((event) => new Date(event.timestamp) >= startDate);
    }
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      events = events.filter((event) => new Date(event.timestamp) <= endDate);
    }

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error in getAllEventsController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Event Coordinators Controllers
const addEventCoordinatorController = async (req, res) => {
  try {
    const newCoordinator = await addEventCoordinator(
      req.params.eventId,
      req.body.userId
    );
    res.status(201).json({
      success: true,
      message: "Coordinator added successfully",
      data: newCoordinator,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getEventCoordinatorsController = async (req, res) => {
  try {
    const coordinators = await getEventCoordinators(req.params.eventId);
    res.status(200).json({
      success: true,
      count: coordinators.length,
      data: coordinators,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const removeEventCoordinatorController = async (req, res) => {
  try {
    await removeEventCoordinator(req.params.eventId, req.params.userId);
    res.status(200).json({
      success: true,
      message: "Coordinator removed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Event Type Controllers
const createEventTypeController = async (req, res) => {
  try {
    const newEventType = await createEventType(req.body.content);
    res.status(201).json({
      success: true,
      message: "Event type created successfully",
      data: newEventType,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllEventTypesController = async (req, res) => {
  try {
    const eventTypes = await getAllEventTypes();
    res.status(200).json({
      success: true,
      count: eventTypes.length,
      data: eventTypes,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateEventTypeController = async (req, res) => {
  try {
    const updatedEventType = await updateEventType(
      req.params.id,
      req.body.content
    );
    res.status(200).json({
      success: true,
      message: "Event type updated successfully",
      data: updatedEventType,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteEventTypeController = async (req, res) => {
  try {
    await deleteEventType(req.params.id);
    res.status(200).json({
      success: true,
      message: "Event type deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// RSVP Controllers
const createRSVPController = async (req, res) => {
  try {
    const newRSVP = await createRSVP(req.body.event_id, req.body.user_id);
    res.status(201).json({
      success: true,
      message: "RSVP created successfully",
      data: newRSVP,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getRSVPsForEventController = async (req, res) => {
  try {
    const rsvps = await getRSVPsForEvent(req.params.eventId);
    res.status(200).json({
      success: true,
      count: rsvps.length,
      data: rsvps,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserRSVPsController = async (req, res) => {
  try {
    const rsvps = await getUserRSVPs(req.params.userId);
    res.status(200).json({
      success: true,
      count: rsvps.length,
      data: rsvps,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteRSVPController = async (req, res) => {
  try {
    await deleteRSVP(req.params.id);
    res.status(200).json({
      success: true,
      message: "RSVP deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllEventsPaneDataController = async (req, res) => {
  try {
    const [events, eventTypes, allRsvps] = await Promise.all([
      getAllEvents(req.query),
      getAllEventTypes(),
      RSVP.find().populate("event_id").populate("user_id"),
    ]);

    const response = {
      success: true,
      data: {
        events: events,
        eventTypes: eventTypes,
        rsvps: allRsvps,
      },
      counts: {
        events: events.length,
        eventTypes: eventTypes.length,
        rsvps: allRsvps.length,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createEventController,
  getEventByIdController,
  updateEventController,
  deleteEventController,
  getAllEventsController,
  addEventCoordinatorController,
  getEventCoordinatorsController,
  removeEventCoordinatorController,
  createEventTypeController,
  getAllEventTypesController,
  updateEventTypeController,
  deleteEventTypeController,
  createRSVPController,
  getRSVPsForEventController,
  getUserRSVPsController,
  deleteRSVPController,
  getAllEventsPaneDataController,
};
