const express = require('express');
const { registerWithEmail, login } = require('../controllers/authcontroller');

const router = express.Router();

router.post('/register', registerWithEmail);
router.post('/login', login);

module.exports = router;
