const winston = require('winston');
const LokiTransport = require('winston-loki');
const path = require('path');

// Define log format for file and console logging
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create the standard logger instance
const standardLogger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
        })
    ],
});

// Create Loki logger instance with improved configuration
const lokiLogger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new LokiTransport({
            host: process.env.LOKI_HOST || 'http://localhost:3100',
            labels: {
                job: 'infinitum-backend',
                environment: process.env.NODE_ENV || 'development',
                app: 'infinitum'
            },
            json: true,
            format: winston.format.json(),
            replaceTimestamp: true,
            onConnectionError: (err) => {
                console.error('Loki connection error:', err);
            },
            interval: 5, // Batch interval in seconds
            batching: true, // Enable request batching
            clearOnError: false, // Don't clear batch on error
            basicAuth: process.env.LOKI_BASIC_AUTH, // Optional: Add if you have auth enabled
            timeout: 10000 // Timeout in ms
        })
    ]
});

// Add console transport in non-production
if (process.env.NODE_ENV !== 'production') {
    standardLogger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Enhanced combined logger with metadata support
const logger = {
    error: (message, meta = {}) => {
        const logData = {
            ...meta,
            timestamp: new Date().toISOString()
        };
        standardLogger.error(message, logData);
        lokiLogger.error(message, logData);
    },
    warn: (message, meta = {}) => {
        const logData = {
            ...meta,
            timestamp: new Date().toISOString()
        };
        standardLogger.warn(message, logData);
        lokiLogger.warn(message, logData);
    },
    info: (message, meta = {}) => {
        const logData = {
            ...meta,
            timestamp: new Date().toISOString()
        };
        standardLogger.info(message, logData);
        lokiLogger.info(message, logData);
    },
    debug: (message, meta = {}) => {
        const logData = {
            ...meta,
            timestamp: new Date().toISOString()
        };
        standardLogger.debug(message, logData);
        lokiLogger.debug(message, logData);
    },
    stream: {
        write: (message) => {
            const logData = {
                timestamp: new Date().toISOString()
            };
            standardLogger.info(message.trim(), logData);
            lokiLogger.info(message.trim(), logData);
        }
    }
};

module.exports = logger;