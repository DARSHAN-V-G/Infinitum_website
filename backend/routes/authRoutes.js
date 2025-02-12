const express = require('express');
const { registerWithEmail, login ,logout,googleLogin,handleGoogleLogin} = require('../controllers/authcontroller');
const router = express.Router();

router.post('/register', registerWithEmail); //general registration
//router.post('/login', login); //logging in using roll no and password
router.post('/logout',logout); //logging out
router.post("/callback", googleLogin);
router.get("/google",handleGoogleLogin);

module.exports = router;

