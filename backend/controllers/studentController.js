const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const logger = require('../config/logger');

const getProfile = async (req, res) => {
  try {
    const roll_no = req.user.roll_no;
    logger.info(`Fetching profile for roll number: ${roll_no}`);

    const { data, error } = await supabase
      .from('student')
      .select('*')
      .eq('roll_no', roll_no)
      .single();

    if (error || !data) {
      logger.warn(`Student not found for roll number: ${roll_no}`);
      return res.status(404).json({ message: 'Student not found' });
    }

    logger.info(`Successfully fetched profile for roll number: ${roll_no}`);
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error fetching profile:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getEventsOfStudent = async (req, res) => {
  try {
    const roll_no = req.user.roll_no;
    logger.info(`Fetching registered events for roll number: ${roll_no}`);

    const { data, error } = await supabase
      .from('registration')
      .select('event_id, event:event(event_name)')
      .eq('roll_no', roll_no);

    if (error) {
      logger.error("Supabase Error while fetching events:", error);
      return res.status(500).json({ error: error.message });
    }

    logger.info(`Successfully fetched ${data.length} events for roll number: ${roll_no}`);
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error fetching events for student:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getProfile, getEventsOfStudent };
