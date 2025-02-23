const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const supabase = require('../config/supabase');
const logger = require('../config/logger');

const generateCertificates = async (req, res) => {
    try {
        const { event_id } = req.body;
        if (!event_id) {
            logger.error("Event ID is required");
            return res.status(400).json({ error: "Event ID is required" });
        }
        
        logger.info(`Fetching attendees for event ID: ${event_id}`);
        const { data: attendees, error: attendeeError } = await supabase
            .from('registration')
            .select('roll_no')
            .eq('event_id', event_id)
            .eq('attended', true);
        
        if (attendeeError || !attendees.length) {
            logger.error(`No attendees found for event ID: ${event_id}`);
            return res.status(404).json({ error: "No attendees found" });
        }
        
        logger.info(`Found ${attendees.length} attendees. Fetching student details.`);
        const rollNos = attendees.map(attendee => attendee.roll_no);
        const { data: students, error: studentError } = await supabase
            .from('student')
            .select('name, roll_no, department')
            .in('roll_no', rollNos);
        
        if (studentError || !students.length) {
            logger.error(`No student data found for event ID: ${event_id}`);
            return res.status(404).json({ error: "No student data found" });
        }
        
        const templatePath = path.join(__dirname, `../templates/Certificate_Event${event_id}.pdf`);
        if (!fs.existsSync(templatePath)) {
            logger.error(`Certificate template missing: ${templatePath}`);
            return res.status(500).json({ error: "Certificate template not found" });
        }
        
        const fontPath = path.join(__dirname, '../templates/Sanchez-Regular.ttf');
        if (!fs.existsSync(fontPath)) {
            logger.error(`Font file missing: ${fontPath}`);
            return res.status(500).json({ error: "Font file not found" });
        }
        
        logger.info(`Generating certificates for ${students.length} students.`);
        const existingPdfBytes = fs.readFileSync(templatePath);
        const fontBytes = fs.readFileSync(fontPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        pdfDoc.registerFontkit(fontkit);
        const customFont = await pdfDoc.embedFont(fontBytes);
        
        const generatedCertificates = [];
        for (const student of students) {
            const page = pdfDoc.getPages()[0];
            const { width, height } = page.getSize();
            const fontSize = 30;
            
            page.drawText(student.name, {
                x: width / 2 - (customFont.widthOfTextAtSize(student.name, fontSize) / 2),
                y: height / 1.8,
                size: fontSize,
                font: customFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(student.roll_no, {
                x: width / 2 - (customFont.widthOfTextAtSize(student.roll_no, fontSize) / 2),
                y: height / 2,
                size: fontSize,
                font: customFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(student.department, {
                x: width / 2 - (customFont.widthOfTextAtSize(student.department, fontSize) / 2),
                y: height / 2.2,
                size: fontSize,
                font: customFont,
                color: rgb(0, 0, 0),
            });
            
            const outputPath = path.join(__dirname, `../public/${student.roll_no}_Event${event_id}_certificate.pdf`);
            fs.writeFileSync(outputPath, await pdfDoc.save());
            generatedCertificates.push({ roll_no: student.roll_no, certificate: outputPath });
            logger.info(`Certificate generated for ${student.roll_no}`);
        }
        
        logger.info(`Certificates generated successfully for event ID: ${event_id}`);
        res.json({ message: "Certificates generated successfully", certificates: generatedCertificates });
        
    } catch (error) {
        logger.error(`Error generating certificates: ${error.message}`);
        res.status(500).json({ error: "Error generating certificates" });
    }
};

module.exports = { generateCertificates };
