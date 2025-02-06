const express = require('express');
const { registerForEvent, getAllEvents, getStudentsByEvent,createEvent } = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAllEvents);                     
router.post('/register/:eventid', authMiddleware, registerForEvent);  
router.post('/create', createEvent);  
router.get('/fetch/:event_id', authMiddleware, getStudentsByEvent);

module.exports = router;
