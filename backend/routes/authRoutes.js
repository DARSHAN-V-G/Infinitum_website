const express = require('express');
const { register,logout,googleLogin,handleGoogleLogin} = require('../controllers/authController');
const router = express.Router();

router.post('/register', register); //general registration
//router.post('/login', login); //logging in using roll no and password
router.post('/logout',logout); //logging out
router.post("/callback", googleLogin);
router.get("/google",handleGoogleLogin);

module.exports = router;

