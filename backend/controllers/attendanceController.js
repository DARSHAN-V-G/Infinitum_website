const supabase = require('../config/supabase.js');
const logger = require('../config/logger.js'); 

const putAttendance = async (req, res) => {
  const { roll_no, event_id } = req.body;

  logger.info("Received request to update attendance", { roll_no, event_id });

  if (req.user.username !== "infinitum") {
    logger.error("Unauthorized access attempt by user: " + req.user.username);
    return res.status(400).json({ error: "Invalid credentials" });
  }

  if (!roll_no || !event_id) {
    logger.error("Missing required fields: roll_no or event_id");
    return res.status(400).json({ error: 'roll_no and event_id are required' });
  }

  try {
    const { data, error } = await supabase
      .from('registration')
      .select('attended')
      .eq('event_id', event_id)
      .eq('roll_no', roll_no);

    if (error) throw error;

    if (data.length === 0) {
      logger.error("No registration found for the given roll_no and event_id");
      return res.status(404).json({ error: "No registration found" });
    }

    const attendance = data[0].attended === 1 ? 0 : 1;
    console.log(attendance);

    const { data2, error2 } = await supabase
      .from('registration')
      .update({ attended: attendance })
      .match({ roll_no, event_id });

    if (error2){
      logger.error("Error fetching registration details while marking attendance ",error2);
      res.status(500).json({ error: err.message });
    }

    logger.info("Attendance updated successfully", { roll_no, event_id });
    res.status(200).json({ message: "Attendance marked", data: data2 });
  } catch (err) {
    logger.error("Error updating attendance", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

module.exports = { putAttendance };