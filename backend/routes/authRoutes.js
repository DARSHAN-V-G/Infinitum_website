const express = require('express');
const { registerWithEmail, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerWithEmail);
router.post('/login', login);

module.exports = router;
