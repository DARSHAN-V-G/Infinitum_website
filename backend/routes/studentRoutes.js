const express = require('express');
const { getProfile, getEventsOfStudent } = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/profile', authMiddleware,getProfile); //fetching the student details to display in dashboard
router.get('/registeredEvents',authMiddleware,getEventsOfStudent); //fetching the events registered by a particular student
module.exports = router;
