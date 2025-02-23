const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const logger = require("../config/logger"); 
require("dotenv").config();
const supabase = require("../config/supabase");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const sendCertificates = async (req, res) => {
    try {
        const { event_id } = req.body;
        if (!event_id) {
            logger.error("Event ID is required");
            return res.status(400).json({ error: "Event ID is required" });
        }

        logger.info(`Fetching attendees for event_id: ${event_id}`);
        const { data: attendees, error } = await supabase
            .from("registration")
            .select("roll_no")
            .eq("event_id", event_id)
            .eq("attended", true);

        if (error || !attendees || attendees.length === 0) {
            logger.error(`No attendees found for event_id: ${event_id}`);
            return res.status(404).json({ error: "No attendees found" });
        }

        const rollNos = attendees.map(a => a.roll_no);
        logger.info(`Fetching student details for ${rollNos.length} attendees`);
        const { data: students, error: studentError } = await supabase
            .from("student")
            .select("name, email, roll_no")
            .in("roll_no", rollNos);

        if (studentError || !students) {
            logger.error("Error fetching student details");
            return res.status(500).json({ error: "Error fetching student details" });
        }

        const emailPromises = students.map(async (student) => {
            const filePath = path.join(__dirname, `../public/${student.roll_no}_Event${event_id}_certificate.pdf`);

            if (!fs.existsSync(filePath)) {
                logger.warn(`Certificate file not found for roll_no: ${student.roll_no}`);
                return;
            }

            const certificateBuffer = fs.readFileSync(filePath);

            try {
                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: student.email,
                    subject: "Your Certificate",
                    html: `<p>Hello ${student.name},</p>
                           <p>Your certificate for Event ID ${event_id} is attached.</p>
                           <p>Best Regards,</p>
                           <p>Certificate Team</p>`,
                    attachments: [
                        {
                            filename: `${student.roll_no}_Event${event_id}_certificate.pdf`,
                            content: certificateBuffer,
                        },
                    ],
                };

                const response = await transporter.sendMail(mailOptions);
                logger.info(`✅ Email sent to ${student.email}: ${response.messageId}`);
            } catch (emailError) {
                logger.error(`❌ Failed to send email to ${student.email}: ${emailError.message}`);
            }
        });

        await Promise.all(emailPromises);
        logger.info("All emails processed");
        res.json({ message: "Emails sent successfully" });
    } catch (error) {
        logger.error(`Error sending emails: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { sendCertificates };