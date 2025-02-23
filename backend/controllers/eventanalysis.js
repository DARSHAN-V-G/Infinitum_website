const logger = require("../config/logger");
const db = require("../models");

const getStudentClassData = async () => {
    try {
        logger.info("Fetching student class data...");

        const students = await db.Student.findAll();
        if (!students || students.length === 0) {
            logger.warn("No students found in the database.");
            return [];
        }

        logger.info(`Fetched ${students.length} students from the database.`);

        const classCounts = students.reduce((acc, student) => {
            acc[student.class] = (acc[student.class] || 0) + 1;
            return acc;
        }, {});

        const totalStudents = students.length;
        const classPercentages = Object.keys(classCounts).map(className => ({
            class: className,
            percentage: (classCounts[className] / totalStudents) * 100
        }));

        logger.info("Successfully calculated class percentages.");
        return classPercentages;
    } catch (error) {
        logger.error("Error fetching student class data:", error);
        throw error;
    }
};

module.exports = {
    getStudentClassData
};
