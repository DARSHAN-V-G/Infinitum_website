const express = require('express');
const { generateCertificates } = require('../controllers/certificateController');
const { sendCertificates } = require('../controllers/EmailController');

const router = express.Router();

router.post('/generate-certificates', generateCertificates);
router.post('/send-certificates', sendCertificates);

module.exports = router;
