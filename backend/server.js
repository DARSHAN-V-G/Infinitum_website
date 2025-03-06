const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const studentRoutes = require('./routes/studentRoutes')
const certificateRoutes = require('./routes/certificateRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes')
const bodyParser = require("body-parser");

// Load and validate environment variables
dotenv.config();
const requiredEnvVars = ['PORT', 'SUPABASE_URL', 'SUPABASE_KEY', 'JWT_SECRET_KEY', 'FRONTEND_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

logger.info("Connected to supabase");
const app = express();

// Security middleware
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);


logger.stream = {
  write: function (message) {
    logger.info(message.trim());
  },
};

// Override logger.log to use winston
logger.log = function (message) {
  logger.info(message);
};

// CORS configuration
const allowedOrigins = [process.env.FRONTEND_URL, "https://infinitum-csea.vercel.app","https://infinitum.psgtech.ac.in"];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      logger.warn(`Blocked request from unauthorized origin: ${origin}`);
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.get("/", (req, res) => {
  res.send("Welcome to the Infinitum Backend SDK");
});

// Body parsing middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/student', studentRoutes);
app.use("/api/certificate", certificateRoutes);
app.use('/api/attendance', attendanceRoutes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    status: err.status || 500,
    route: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  res.status(err.status || 500).send({
    error: {
      message: err.message,
    },
  });
});


// Handle unhandled routes
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

app.get("/", async (req, res) => {
  res.send("Welcome to the Infinitum Backend SDK");
});

app.listen(process.env.PORT, () => {
  logger.info(`Server is running on http://localhost:${process.env.PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});