const {putAttendance} = require('../controllers/attendanceController.js');
const express = require('express');

const router = express.Router();

router.post("/putattendance", putAttendance);

module.exports = router;