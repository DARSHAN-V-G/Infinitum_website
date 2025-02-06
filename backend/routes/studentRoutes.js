const express = require('express');
const { getProfile } = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/profile', authMiddleware,getProfile);

module.exports = router;
