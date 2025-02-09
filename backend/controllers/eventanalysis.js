const getStudentClassData = async () => {
    try {
        const students = await db.Student.findAll(); // Fetch all students from the database
        const classCounts = students.reduce((acc, student) => {
            acc[student.class] = (acc[student.class] || 0) + 1;
            return acc;
        }, {});

        const totalStudents = students.length;
        const classPercentages = Object.keys(classCounts).map(className => ({
            class: className,
            percentage: (classCounts[className] / totalStudents) * 100
        }));

        return classPercentages;
    } catch (error) {
        console.error('Error fetching student class data:', error);
        throw error;
    }
};

module.exports = {
    getStudentClassData
};