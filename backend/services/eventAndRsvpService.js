const Event = require('../models/Event');
const EventCoordinators = require('../models/EventCoordinators');
const EventType = require('../models/EventType');
const RSVP = require('../models/RSVP');
const File = require('../models/File'); 
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");



const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const saveFile = async (file) => {
  if (!file || !file.buffer) {
    console.error("Error: No file buffer provided");
    return null;
  }

  const { originalname, mimetype, buffer, size } = file; // Ensure file.buffer is available
  const filename = `${Date.now()}-${originalname.replace(/\s+/g, '_')}`; // Replace spaces to avoid issues
  const filePath = path.join(uploadDir, filename);

  console.log("Filename:", filename);
  console.log("Saving file to:", filePath);

  try {
    fs.writeFileSync(filePath, buffer); 
    console.log("File saved successfully:", filePath);
  } catch (error) {
    console.error("Error writing file:", error);
    return null;
  }

  try {
    const newFile = new File({
      filename,
      originalName: originalname,
      path: filePath,
      fileType: mimetype.startsWith("image") ? "image" : "video",
      mimeType: mimetype,
      size, // Corrected: Use size directly
    });

    await newFile.save();
    return newFile._id;
  } catch (error) {
    console.error("Error saving file to database:", error);
    return null;
  }
};

// Updated createEvent function to handle file upload
const createEvent = async (eventData, imageFile) => {
  try {
    // If there's an image file, save it and get the file ID
    if (imageFile) {
      const fileId = await saveFile(imageFile);
      eventData.image = fileId;
    }

    const newEvent = new Event(eventData);
    await newEvent.save();
    
    // Populate the image field if it exists
    if (newEvent.image) {
      await newEvent.populate('image');
    }
    
    return newEvent;
  } catch (error) {
    // Clean up the uploaded file if event creation fails
    if (imageFile && eventData.image) {
      try {
        const filePath = path.join(uploadDir, imageFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    throw new Error(`Error creating event: ${error.message}`);
  }
};

const getEventById = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  } catch (error) {
    throw new Error(`Error fetching event: ${error.message}`);
  }
};

const updateEvent = async (eventId, updateData, imageFile) => {
  try {
    let event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Handle image update if new image is provided
    if (imageFile) {
      // Save the new file
      const fileId = await saveFile(imageFile);
      
      // If there was a previous image, delete the old file
      if (event.image) {
        try {
          const oldFile = await File.findById(event.image);
          if (oldFile) {
            const oldFilePath = path.join(uploadDir, oldFile.filename);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
            await File.findByIdAndDelete(event.image);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up old file:', cleanupError);
        }
      }
      
      updateData.image = fileId;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId, 
      updateData, 
      { new: true }
    ).populate('image');

    if (!updatedEvent) {
      throw new Error('Event not found');
    }

    return updatedEvent;
  } catch (error) {
    // Clean up the uploaded file if update fails
    if (imageFile && updateData.image) {
      try {
        const filePath = path.join(uploadDir, imageFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    throw new Error(`Error updating event: ${error.message}`);
  }
};

const deleteEvent = async (eventId) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      throw new Error('Event not found');
    }
    // Clean up related data
    await EventCoordinators.deleteMany({ event_id: eventId });
    await RSVP.deleteMany({ event_id: eventId });
    return deletedEvent;
  } catch (error) {
    throw new Error(`Error deleting event: ${error.message}`);
  }
};

const getAllEvents = async (filters = {}) => {
  try {
    return await Event.find(filters);
  } catch (error) {
    throw new Error(`Error fetching events: ${error.message}`);
  }
};

// Event Coordinators CRUD Operations
const addEventCoordinator = async (eventId, userId) => {
  try {
    const existingCoordinator = await EventCoordinators.findOne({ event_id: eventId, user_id: userId });
    if (existingCoordinator) {
      throw new Error('User is already a coordinator for this event');
    }
    
    const newCoordinator = new EventCoordinators({
      event_id: eventId,
      user_id: userId
    });
    await newCoordinator.save();
    return newCoordinator;
  } catch (error) {
    throw new Error(`Error adding event coordinator: ${error.message}`);
  }
};

const getEventCoordinators = async (eventId) => {
  try {
    return await EventCoordinators.find({ event_id: eventId }).populate('user_id');
  } catch (error) {
    throw new Error(`Error fetching event coordinators: ${error.message}`);
  }
};

const removeEventCoordinator = async (eventId, userId) => {
  try {
    const result = await EventCoordinators.findOneAndDelete({ event_id: eventId, user_id: userId });
    if (!result) {
      throw new Error('Coordinator not found for this event');
    }
    return result;
  } catch (error) {
    throw new Error(`Error removing event coordinator: ${error.message}`);
  }
};

// Event Type CRUD Operations
const createEventType = async (content) => {
  try {
    const newEventType = new EventType({ content });
    await newEventType.save();
    return newEventType;
  } catch (error) {
    throw new Error(`Error creating event type: ${error.message}`);
  }
};

const getAllEventTypes = async () => {
  try {
    return await EventType.find();
  } catch (error) {
    throw new Error(`Error fetching event types: ${error.message}`);
  }
};

const updateEventType = async (eventTypeId, content) => {
  try {
    const updatedEventType = await EventType.findByIdAndUpdate(
      eventTypeId,
      { content },
      { new: true }
    );
    if (!updatedEventType) {
      throw new Error('Event type not found');
    }
    return updatedEventType;
  } catch (error) {
    throw new Error(`Error updating event type: ${error.message}`);
  }
};

const deleteEventType = async (eventTypeId) => {
  try {
    // Check if any events are using this type
    const eventsUsingType = await Event.countDocuments({ event_type_id: eventTypeId });
    if (eventsUsingType > 0) {
      throw new Error('Cannot delete event type as it is being used by events');
    }
    
    const deletedEventType = await EventType.findByIdAndDelete(eventTypeId);
    if (!deletedEventType) {
      throw new Error('Event type not found');
    }
    return deletedEventType;
  } catch (error) {
    throw new Error(`Error deleting event type: ${error.message}`);
  }
};

// RSVP CRUD Operations
const createRSVP = async (eventId, userId) => {
  try {
    // Check if RSVP already exists
    const existingRSVP = await RSVP.findOne({ event_id: eventId, user_id: userId });
    if (existingRSVP) {
      throw new Error('User has already RSVPed for this event');
    }
    
    const newRSVP = new RSVP({
      event_id: eventId,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
    await newRSVP.save();
    return newRSVP;
  } catch (error) {
    throw new Error(`Error creating RSVP: ${error.message}`);
  }
};

const getRSVPsForEvent = async (eventId) => {
  try {
    return await RSVP.find({ event_id: eventId }).populate('user_id');
  } catch (error) {
    throw new Error(`Error fetching RSVPs: ${error.message}`);
  }
};

const getUserRSVPs = async (userId) => {
  try {
    return await RSVP.find({ user_id: userId }).populate('event_id');
  } catch (error) {
    throw new Error(`Error fetching user RSVPs: ${error.message}`);
  }
};

const deleteRSVP = async (rsvpId) => {
  try {
    const deletedRSVP = await RSVP.findByIdAndDelete(rsvpId);
    if (!deletedRSVP) {
      throw new Error('RSVP not found');
    }
    return deletedRSVP;
  } catch (error) {
    throw new Error(`Error deleting RSVP: ${error.message}`);
  }
};

module.exports = {
  // Event CRUD
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEvents,
  
  // Event Coordinators CRUD
  addEventCoordinator,
  getEventCoordinators,
  removeEventCoordinator,
  
  // Event Type CRUD
  createEventType,
  getAllEventTypes,
  updateEventType,
  deleteEventType,
  
  // RSVP CRUD
  createRSVP,
  getRSVPsForEvent,
  getUserRSVPs,
  deleteRSVP
};