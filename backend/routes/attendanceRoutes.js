const {putAttendance} = require('../controllers/attendanceController.js');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post("/putattendance", authMiddleware,putAttendance);

module.exports = router;