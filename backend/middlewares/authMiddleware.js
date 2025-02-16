const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn('Authentication failed: No token provided', {
                ip: req.ip,
                path: req.path
            });
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            logger.warn('Authentication failed: Invalid token format', {
                ip: req.ip,
                path: req.path
            });
            return res.status(401).json({ error: "Invalid token format" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if (!decoded.roll_no && !decoded.username) {
                logger.warn('Authentication failed: Invalid token payload', {
                    ip: req.ip,
                    path: req.path
                });
                return res.status(401).json({ error: "Invalid token payload" });
            }
            req.user = decoded;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                logger.warn('Authentication failed: Token expired', {
                    ip: req.ip,
                    path: req.path
                });
                return res.status(401).json({ error: "Token expired" });
            }
            if (err.name === 'JsonWebTokenError') {
                logger.warn('Authentication failed: Invalid token', {
                    ip: req.ip,
                    path: req.path
                });
                return res.status(401).json({ error: "Invalid token" });
            }
            throw err;
        }
    } catch (err) {
        logger.error('Auth Middleware Error:', {
            error: err.message,
            stack: err.stack,
            ip: req.ip,
            path: req.path
        });
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = authMiddleware;