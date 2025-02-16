const express = require('express');
const { registerForEvent, getAllEvents, getStudentsByEvent,createEvent } = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAllEvents);  //fetch all the event details (no auth needed) 
router.post('/register', authMiddleware, registerForEvent);  //student registering for a particular event (event_id in body)
router.post('/create', createEvent);  //creating event by passing event details in body by admin
router.get('/fetch/:event_id', authMiddleware,getStudentsByEvent); //fetching the registration list for each event (admin purpose)

module.exports = router;
