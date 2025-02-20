const supabase = require('../config/supabase');


const registerForEvent = async (req, res) => {
    const { event_id } = req.body;
    const roll_no = req.user.roll_no; 
    if (!event_id) return res.status(400).json({ error: "Event ID is required" });

    const { data: event, error: eventError } = await supabase
        .from('event')
        .select('*')
        .eq('event_id', event_id)
        .single();

    if (!event || eventError) return res.status(404).json({ error: "Event not found" });

    const { data: existing, error: checkError } = await supabase
        .from('registration')
        .select('*')
        .eq('roll_no', roll_no)
        .eq('event_id', event_id)
        .single();

    if (existing) return res.status(400).json({ error: "Already registered for this event" });

    // Register the student
    const { error } = await supabase
        .from('registration')
        .insert([{ roll_no, event_id }]);

    if (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });}

    res.status(201).json({ message: "Successfully registered for the event!" });
};



const getAllEvents = async (req, res) => {
    const { data, error } = await supabase.from('event').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};



const getStudentsByEvent = async (req, res) => {
    try {
        if(req.user.username!=="infinitum"){
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const { event_id } = req.params;

        const { data, error } = await supabase
            .from('registration')
            .select('roll_no, attended,student:student(name, email, phn_no),attended')
            .eq('event_id', event_id);

        if (error) {
            console.error("Supabase Error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


const createEvent = async (req, res) => {
    try {
        const { event_id, event_name, description } = req.body;

        if (!event_id || !event_name || !description) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const { data, error } = await supabase
            .from('event')
            .insert([{ event_id, event_name, description }]);

        if (error) {
            console.error("Supabase Insert Error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: "Event created successfully!", data });
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { createEvent };



module.exports = { registerForEvent, getAllEvents, getStudentsByEvent,createEvent };
