// services/eventService.js
const Event = require("../models/Event");
const EventCoordinator = require("../models/EventCoordinators");
const EventType = require("../models/EventType");

class EventService {
  // Event CRUD operations
  async createEvent(eventData) {
    try {
      const event = new Event(eventData);
      return await event.save();
    } catch (error) {
      throw error;
    }
  }

  async getAllEvents(query = {}) {
    try {
      return await Event.find(query);
    } catch (error) {
      throw error;
    }
  }

  async getEventById(id) {
    try {
      return await Event.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateEvent(id, eventData) {
    try {
      return await Event.findByIdAndUpdate(id, eventData, { new: true });
    } catch (error) {
      throw error;
    }
  }

  async deleteEvent(id) {
    try {
      return await Event.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Event Coordinator CRUD operations
  async createEventCoordinator(coordinatorData) {
    try {
      const coordinator = new EventCoordinator(coordinatorData);
      return await coordinator.save();
    } catch (error) {
      throw error;
    }
  }

  async getAllEventCoordinators(query = {}) {
    try {
      return await EventCoordinator.find(query)
        .populate("event_id")
        .populate("user_id");
    } catch (error) {
      throw error;
    }
  }

  async getEventCoordinatorById(id) {
    try {
      return await EventCoordinator.findById(id)
        .populate("event_id")
        .populate("user_id");
    } catch (error) {
      throw error;
    }
  }

  async getCoordinatorsByEventId(eventId) {
    try {
      return await EventCoordinator.find({ event_id: eventId }).populate(
        "user_id"
      );
    } catch (error) {
      throw error;
    }
  }

  async updateEventCoordinator(id, coordinatorData) {
    try {
      return await EventCoordinator.findByIdAndUpdate(id, coordinatorData, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteEventCoordinator(id) {
    try {
      return await EventCoordinator.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Event Type CRUD operations
  async createEventType(typeData) {
    try {
      const eventType = new EventType(typeData);
      return await eventType.save();
    } catch (error) {
      throw error;
    }
  }

  async getAllEventTypes() {
    try {
      return await EventType.find();
    } catch (error) {
      throw error;
    }
  }

  async getEventTypeById(id) {
    try {
      return await EventType.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateEventType(id, typeData) {
    try {
      return await EventType.findByIdAndUpdate(id, typeData, { new: true });
    } catch (error) {
      throw error;
    }
  }

  async deleteEventType(id) {
    try {
      return await EventType.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EventService();
