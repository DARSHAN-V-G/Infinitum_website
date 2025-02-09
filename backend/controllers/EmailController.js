const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

exports.sendCertificateEmail = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: "Email and Name are required" });
    }

    const filePath = path.join(__dirname, `../public/${name}_certificate.pdf`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Certificate",
      text: `Hello ${name},\n\nYour certificate is attached.\n\nBest Regards,\nCertificate Generator`,
      attachments: [
        {
          filename: `${name}_certificate.pdf`,
          path: filePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

