const supabase = require('../config/supabase');
const logger = require('../config/logger');

const registerForEvent = async (req, res) => {
    try {
        const { event_id } = req.body;
        const roll_no = req.user.roll_no;

        if (!event_id) {
            logger.warn("Event ID missing in request");
            return res.status(400).json({ error: "Event ID is required" });
        }

        logger.info(`Registering user ${roll_no} for event ${event_id}`);

        const { data: event, error: eventError } = await supabase
            .from('event')
            .select('*')
            .eq('event_id', event_id)
            .single();

        if (!event || eventError) {
            logger.warn(`Event not found: ${event_id}`);
            return res.status(404).json({ error: "Event not found" });
        }

        const { data: existing, error: checkError } = await supabase
            .from('registration')
            .select('*')
            .eq('roll_no', roll_no)
            .eq('event_id', event_id)
            .single();

        if (existing) {
            logger.warn(`User ${roll_no} already registered for event ${event_id}`);
            return res.status(400).json({ error: "Already registered for this event" });
        }

        const { error } = await supabase
            .from('registration')
            .insert([{ roll_no, event_id }]);

        if (error) {
            logger.error("Error registering user:", error);
            return res.status(500).json({ error: error.message });
        }

        logger.info(`User ${roll_no} successfully registered for event ${event_id}`);
        res.status(201).json({ message: "Successfully registered for the event!" });

    } catch (err) {
        logger.error("Unexpected server error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getAllEvents = async (req, res) => {
    try {
        logger.info("Fetching all events...");
        const { data, error } = await supabase.from('event').select('*');

        if (error) {
            logger.error("Error fetching events:", error);
            return res.status(500).json({ error: error.message });
        }

        logger.info("Successfully fetched events");
        res.status(200).json(data);
    } catch (err) {
        logger.error("Unexpected server error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getStudentsByEvent = async (req, res) => {
    try {
        if (req.user.username !== "infinitum") {
            logger.warn("Unauthorized access attempt by user:", req.user.username);
            return res.status(403).json({ error: "Invalid credentials" });
        }

        const { event_id } = req.params;
        logger.info(`Fetching students for event ${event_id}`);

        const { data, error } = await supabase
            .from('registration')
            .select('roll_no, attended, student:student(name, email, phn_no)')
            .eq('event_id', event_id);

        if (error) {
            logger.error("Supabase error while fetching students:", error);
            return res.status(500).json({ error: error.message });
        }

        logger.info(`Successfully fetched ${data.length} students for event ${event_id}`);
        res.json(data);
    } catch (err) {
        logger.error("Unexpected server error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const createEvent = async (req, res) => {
    try {
        const { event_id, event_name, description } = req.body;

        if (!event_id || !event_name || !description) {
            logger.warn("Missing fields in create event request");
            return res.status(400).json({ error: "All fields are required" });
        }

        logger.info(`Creating event: ${event_id} - ${event_name}`);

        const { data, error } = await supabase
            .from('event')
            .insert([{ event_id, event_name, description }]);

        if (error) {
            logger.error("Supabase error while creating event:", error);
            return res.status(500).json({ error: error.message });
        }

        logger.info(`Event ${event_id} created successfully`);
        res.status(201).json({ message: "Event created successfully!", data });
    } catch (err) {
        logger.error("Unexpected server error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { registerForEvent, getAllEvents, getStudentsByEvent, createEvent };
