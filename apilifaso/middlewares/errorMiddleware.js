// filepath: backend/middlewares/errorMiddleware.js
const winston = require('winston');

const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log' }),
    ],
});

const errorHandler = (err, req, res, next) => {
    logger.error(err.message, { metadata: err });
    res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = errorHandler;