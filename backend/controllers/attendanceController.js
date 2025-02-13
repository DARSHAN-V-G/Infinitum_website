const supabase = require('../config/supabase.js')

const putAttendance = async (req,res)=>{
  const { roll_no, event_id } = req.body;
  if (!roll_no || !event_id) {
    return res.status(400).json({ error: 'roll_no and event_id are required' });
  }

  try {
    const { data, error } = await supabase
      .from('registration')
      .update({ attended: 1 })
      .match({ roll_no, event_id, attended: 0 });

    if (error) throw error;

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {putAttendance};