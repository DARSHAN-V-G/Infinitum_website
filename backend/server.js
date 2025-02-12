const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const studentRoutes = require('./routes/studentRoutes')
dotenv.config();
console.log("Connected to supabase");
const app = express();
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));
app.use(express.json());
app.use(cookieParser());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes); 
app.use('/api/student',studentRoutes)


app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});