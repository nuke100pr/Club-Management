const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
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
    getAllEventsPaneDataController
} = require('../controllers/eventAndRsvpController');

const upload = multer({
    storage: multer.memoryStorage(),
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Event Routes
router.route('/')
    .post(upload.single('image'), createEventController)
    .get(getAllEventsController);

router.route('/:id')
    .get(getEventByIdController)
    .put(upload.single('image'), updateEventController)
    .delete(deleteEventController);

// Event Coordinators Routes
router.route('/:eventId/coordinators')
    .post(addEventCoordinatorController)
    .get(getEventCoordinatorsController);

router.route('/:eventId/coordinators/:userId')
    .delete(removeEventCoordinatorController);

// Event Type Routes
router.route('/types')
    .post(createEventTypeController)
    .get(getAllEventTypesController);

router.route('/types/:id')
    .put(updateEventTypeController)
    .delete(deleteEventTypeController);

// RSVP Routes
router.route('/:eventId/rsvp')
    .post(createRSVPController)
    .get(getRSVPsForEventController);

router.route('/users/:userId/rsvps')
    .get(getUserRSVPsController);

router.route('/rsvp/:id')
    .delete(deleteRSVPController);

router.route('/alldata/events')
    .get(getAllEventsPaneDataController);

module.exports = router;