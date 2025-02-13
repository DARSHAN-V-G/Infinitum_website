const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const supabase = require('../config/supabase');

exports.generateCertificates = async (req, res) => {
    try {
        const { event_id } = req.body;
        if (!event_id) {
            return res.status(400).json({ error: "Event ID is required" });
        }

        // Fetch attendees who attended the event
        const { data: attendees, error } = await supabase
            .from('registration')
            .select('roll_no')
            .eq('event_id', event_id)
            .eq('attended', true);

        if (error || !attendees.length) {
            return res.status(404).json({ error: "No attendees found" });
        }

        for (const attendee of attendees) {
            const { data: student, error: studentError } = await supabase
                .from('student')
                .select('name, roll_no, department')
                .eq('roll_no', attendee.roll_no)
                .single();

            if (studentError || !student) continue;

            const templatePath = path.join(__dirname, `../templates/Certificate_Event${event_id}.pdf`);
            if (!fs.existsSync(templatePath)) continue;

            const existingPdfBytes = fs.readFileSync(templatePath);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            pdfDoc.registerFontkit(fontkit);

            const fontPath = path.join(__dirname, '../templates/Sanchez-Regular.ttf');
            if (!fs.existsSync(fontPath)) continue;

            const fontBytes = fs.readFileSync(fontPath);
            const customFont = await pdfDoc.embedFont(fontBytes);

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
        }

        res.json({ message: "Certificates generated successfully" });

    } catch (error) {
        console.error("Error generating certificates:", error.message);
        res.status(500).json({ error: "Error generating certificates" });
    }
};
