const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const logger = require('../config/logger.js');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const register = async (req, res) => {
    try {
        const { roll_no, name, phn_no, department, year, source , referral} = req.body;
        logger.info(`Register attempt for roll_no: ${roll_no}`);

        const { data: existingUser, error: checkError } = await supabase
            .from('student')
            .select('roll_no')
            .eq('roll_no', roll_no)
            .single();

        if (existingUser) {
            logger.error(`Registration failed: Roll number ${roll_no} already exists`);
            return res.status(400).json({ error: "Roll number already exists!" });
        }

        const email = `${roll_no.toLowerCase()}@psgtech.ac.in`;

        const { data, error } = await supabase.from('student').insert([
            { roll_no, name, email, phn_no, department, year, source, referral}
        ]);

        if (error) throw error;

        const token = jwt.sign({ roll_no }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        logger.info(`User registered successfully: ${roll_no}`);
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
        logger.error(`Registration error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

const logout = async (req, res) => {
    logger.info(`User logged out: ${req.user?.roll_no || 'Unknown'}`);
    res.clearCookie("session");
    res.json({ message: "Logged out successfully" });
};

const googleLogin = async (req, res) => {
    try {
        const { access_token } = req.body;
        if (!access_token) {
            logger.error("Google login failed: Missing access token");
            return res.status(400).json({ message: "Missing tokens in callback." });
        }

        const response = await supabase.auth.getUser(access_token);
        if (!response.data || !response.data.user) {
            logger.error("Google login failed: Invalid user data from Supabase");
            return res.status(400).json({ message: "Invalid user data from Supabase." });
        }

        const userInfo = response.data.user;
        const email = userInfo.email;
        const name = userInfo.user_metadata?.full_name || userInfo.user_metadata?.name || "Unknown";
        const roll_no = email.split("@")[0].toUpperCase();

        const { data, error } = await supabase
            .from('student')
            .select('*')
            .eq('roll_no', roll_no)
            .single();

        if (error || !data) {
            logger.error(`Google login failed: Student not found for email ${email}`);
            return res.status(404).json({ message: "Student not found", user: { name, email, roll_no } });
        }

        const token = jwt.sign({ roll_no: data.roll_no }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        logger.info(`Google login successful for ${roll_no}`);
        return res.status(200).json({ message: "OAuth login successful!", token, user: { name, email, roll_no } });
    } catch (error) {
        logger.error(`Google login error: ${error.message}`);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const handleGoogleLogin = async (req, res) => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `https://infinitum.psgtech.ac.in/auth/callback`,
            },
        });

        if (error) {
            logger.error(`Google sign-in error: ${error.message}`);
            return res.status(500).json({ message: "Google Sign-in Error", error: error.message });
        }

        logger.info("Google OAuth initiated successfully");
        return res.json({ authUrl: data.url });
    } catch (err) {
        logger.error(`Google login initiation error: ${err.message}`);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

const adminRegister = async (req, res) => {
    try {
        const { username, password } = req.body;
        logger.info(`Admin registration attempt: ${username}`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data, error } = await supabase
            .from("admin")
            .insert([{ username, password: hashedPassword }]);

        if (error) throw error;

        logger.info(`Admin registered successfully: ${username}`);
        res.json({ message: "Admin registered successfully", admin: data });
    } catch (err) {
        logger.error(`Admin registration error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        logger.info(`Admin login attempt: ${username}`);

        const { data, error } = await supabase
            .from("admin")
            .select("*")
            .eq("username", username)
            .single();

        if (error || !data) {
            logger.error(`Admin login failed: Invalid credentials for ${username}`);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, data.password);
        if (!validPassword) {
            logger.error(`Admin login failed: Incorrect password for ${username}`);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ username: data.username }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        logger.info(`Admin login successful: ${username}`);
        res.json({ message: "Login successful", token });
    } catch (err) {
        logger.error(`Admin login error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, logout, googleLogin, handleGoogleLogin, adminLogin };
