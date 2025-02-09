const express = require("express");
const { generateCertificate } = require("../controllers/certificateController");
const { sendCertificateEmail } = require("../controllers/emailController");

const router = express.Router();

router.post("/generate", generateCertificate);
router.post("/send-email", sendCertificateEmail);

module.exports = router;
