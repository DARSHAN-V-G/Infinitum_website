const supabase = require('../config/supabase.js')

const putAttendance = async (req,res)=>{
  const { roll_no, event_id,attendance } = req.body;
  if(req.user.username!=="infinitum"){
    return res.status(400).json({ error: "Invalid credentials" });
}
  if (!roll_no || !event_id) {
    return res.status(400).json({ error: 'roll_no and event_id are required' });
  }

  try {
    const { data, error } = await supabase
      .from('registration')
      .update({ attended: attendance })
      .match({ roll_no, event_id});

    if (error) throw error;

    res.status(200).json({ message : "Attendance marked",data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {putAttendance};