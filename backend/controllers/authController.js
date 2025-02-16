const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const register = async (req, res) => {
    try {
        const { roll_no, name, phn_no, department, year} = req.body;
        const { data: existingUser, error: checkError } = await supabase
            .from('student')
            .select('roll_no')
            .eq('roll_no', roll_no)
            .single();
        const email = `${roll_no.toLowerCase()}@psgtech.ac.in`
        if (existingUser) {
            return res.status(400).json({ error: "Roll number already exists!" });
        }
        const { data, error } = await supabase.from('student').insert([
            { roll_no, name, email, phn_no, department, year}
        ]);

        if (error) throw error; 

        const token = jwt.sign({ roll_no }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const logout = async(req,res)=>{
    res.clearCookie("session"); 
    res.json({ message: "Logged out successfully" });
};




const googleLogin= async (req, res) => {
    try {
        const { access_token} = req.body;
        if (!access_token ) {
            return res.status(400).json({ message: "Missing tokens in callback." });
        }
        const response = await supabase.auth.getUser(access_token);
        if (!response.data || !response.data.user) {
            return res.status(400).json({ message: "Invalid user data from Supabase." });
        }

        const userInfo = response.data.user;
        const email = userInfo.email; 
        if (!email) {
            return res.status(400).json({ message: "User email not found." });
        }

        const roll_no = email.split("@")[0].toUpperCase();
        try{
            const { data, error } = await supabase
            .from('student') 
            .select('*')
            .eq('roll_no', roll_no)
            .single();
            const token = jwt.sign({ roll_no : data.roll_no }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
            return res.status(200).json({
                message: "OAuth login successful!",
                token, 
            });
        }catch(error){
            return res.status(404).json({ message: 'Student not found' });
        }

    } catch (error) {
        console.error("Error fetching user info:", error.response?.data || error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



const handleGoogleLogin = async (req, res) => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${process.env.FRONTEND_URL}/auth/callback`, // Redirect after successful login
            },
        });

        if (error) {
            return res.status(500).json({ message: "Google Sign-in Error", error: error.message });
        }

        return res.json({ authUrl: data.url }); // Send the OAuth URL to the frontend
    } catch (err) {
        console.error("Google Login Error:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

const adminRegister = async (req, res) => {
    const { username, password } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into Supabase PostgreSQL
    const { data, error } = await supabase
        .from("admin")
        .insert([{ username, password: hashedPassword }]);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Admin registered successfully", admin: data });
};

const adminLogin = async (req, res) => {
    const { username, password } = req.body;
    
    // Fetch admin from DB
    const { data, error } = await supabase
        .from("admin")
        .select("*")
        .eq("username", username)
        .single();

    if (error || !data) return res.status(400).json({ error: "Invalid credentials" });

    // Compare password
    const validPassword = await bcrypt.compare(password, data.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ username: data.username }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1h"
    });

    res.json({ message: "Login successful", token });
};

module.exports = { register, logout, googleLogin,handleGoogleLogin,adminLogin};
