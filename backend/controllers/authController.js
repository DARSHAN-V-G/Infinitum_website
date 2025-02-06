const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');


dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const registerWithEmail = async (req, res) => {
    try {
        console.log("Registering...");

        const { roll_no, name, email, phn_no, department, year, password } = req.body;

        const { data: existingUser, error: checkError } = await supabase
            .from('student')
            .select('roll_no')
            .eq('roll_no', roll_no)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: "Roll number already exists!" });
        }

        const expectedEmail = `${roll_no}@psgtech.ac.in`;
        if (email !== expectedEmail) {
            return res.status(400).json({ error: "Invalid email format!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase.from('student').insert([
            { roll_no, name, email, phn_no, department, year, password: hashedPassword }
        ]);

        if (error) throw error; 

        const token = jwt.sign({ roll_no }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};



const login = async (req, res) => {
    try {
        const { roll_no, password } = req.body;
        const { data, error } = await supabase.from('student').select('*').eq('roll_no', roll_no).single();

        if (error || !data) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, data.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ roll_no: data.roll_no }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



module.exports = { registerWithEmail, login};
