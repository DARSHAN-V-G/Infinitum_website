const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const supabase = require("../config/supabase");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail email
        pass: process.env.GMAIL_APP_PASSWORD, // Use an App Password if 2FA is enabled
    },
});

exports.sendCertificates = async (req, res) => {
    try {
        const { event_id } = req.body;
        if (!event_id) {
            return res.status(400).json({ error: "Event ID is required" });
        }

        // Fetch attendees who attended
        const { data: attendees, error } = await supabase
            .from("registration")
            .select("roll_no")
            .eq("event_id", event_id)
            .eq("attended", true);

        if (error || !attendees || attendees.length === 0) {
            return res.status(404).json({ error: "No attendees found" });
        }

        // Prepare email promises
        const emailPromises = attendees.map(async (attendee) => {
            const { data: student, error: studentError } = await supabase
                .from("student")
                .select("name, email, roll_no")
                .eq("roll_no", attendee.roll_no)
                .single();

            if (studentError || !student) {
                console.warn(`No student data found for roll no: ${attendee.roll_no}`);
                return;
            }

            const filePath = path.join(__dirname, `../public/${student.roll_no}_Event${event_id}_certificate.pdf`);

            if (!fs.existsSync(filePath)) {
                console.warn(`Certificate file not found for roll no: ${student.roll_no}`);
                return;
            }

            // Read the certificate file
            const certificateBuffer = fs.readFileSync(filePath);

            try {
                const mailOptions = {
                    from: process.env.GMAIL_USER, // Your Gmail email
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
                console.log(`✅ Email sent to ${student.email}:`, response.messageId);
            } catch (emailError) {
                console.error(`❌ Failed to send email to ${student.email}:`, emailError);
            }
        });

        await Promise.all(emailPromises); // Run email sending in parallel

        res.json({ message: "Emails sent successfully" });
    } catch (error) {
        console.error("Error sending emails:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
