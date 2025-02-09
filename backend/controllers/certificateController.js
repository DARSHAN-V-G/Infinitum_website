const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

exports.generateCertificate = async (req, res) => {
    try {
        const templatePath = path.join(__dirname, '../templates/Certificate.pdf');
        if (!fs.existsSync(templatePath)) {
            throw new Error("Certificate template not found.");
        }

        const existingPdfBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        pdfDoc.registerFontkit(fontkit);

        const fontPath = path.join(__dirname, '../templates/Sanchez-Regular.ttf');
        if (!fs.existsSync(fontPath)) {
            throw new Error("Font file not found.");
        }

        const fontBytes = fs.readFileSync(fontPath);
        const customFont = await pdfDoc.embedFont(fontBytes);

        const page = pdfDoc.getPages()[0];
        const { width, height } = page.getSize();
        const fontSize = 30;
        const text = req.body.name || "John Doe";

        page.drawText(text, {
            x: width / 2 - (customFont.widthOfTextAtSize(text, fontSize) / 2),
            y: height /1.8,
            size: fontSize,
            font: customFont,
            color: rgb(0, 0, 0),
        });

        console.log("Certificate generated successfully");

        // Save the modified PDF as a buffer
        const pdfBytes = await pdfDoc.save();

        // Set proper headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename="Certificate.pdf"');
        res.setHeader('Content-Type', 'application/pdf');

        // Send the PDF as a binary file
        res.end(pdfBytes);

    } catch (error) {
        console.error("Error generating certificate:", error.message);
        res.status(500).json({ error: "Error generating certificate", message: error.message });
    }
};
