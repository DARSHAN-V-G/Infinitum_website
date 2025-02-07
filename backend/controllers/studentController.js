
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const getProfile =  async (req, res) => {
  try {
    const roll_no = req.user.roll_no;
    console.log("Fetching profile")
    const { data, error } = await supabase
      .from('student') 
      .select('*')
      .eq('roll_no', roll_no)
      .single(); 

    if (error) {
      return res.status(404).json({ message: 'Student not found' });
    }
    console.log(data);
    res.status(200).json(data);  
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getEventsOfStudent = async (req, res) => {
  try {
    const roll_no = req.user.roll_no;

    const { data, error } = await supabase
      .from('registration')
      .select('event_id, event:event(event_name)')
      .eq('roll_no', roll_no);

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({ error: error.message });
    }
    console.log(data);
    res.status(200).json(data);
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {getProfile,getEventsOfStudent};
