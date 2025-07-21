const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDirectory();
        this.logLevel = process.env.LOG_LEVEL || 'info';
        this.logLevels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...(data && { data })
        };
        return JSON.stringify(logEntry);
    }

    writeToFile(level, formattedMessage) {
        const logFile = path.join(this.logDir, `${level}.log`);
        const logLine = formattedMessage + '\n';
        
        try {
            fs.appendFileSync(logFile, logLine);
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }

    log(level, message, data = null) {
        const levelValue = this.logLevels[level];
        const configuredLevelValue = this.logLevels[this.logLevel];

        if (levelValue <= configuredLevelValue) {
            const formattedMessage = this.formatMessage(level, message, data);
            
            // Always write to console
            console.log(formattedMessage);
            
            // Write to file for error and warn levels
            if (level === 'error' || level === 'warn') {
                this.writeToFile(level, formattedMessage);
            }
        }
    }

    error(message, data = null) {
        this.log('error', message, data);
    }

    warn(message, data = null) {
        this.log('warn', message, data);
    }

    info(message, data = null) {
        this.log('info', message, data);
    }

    debug(message, data = null) {
        this.log('debug', message, data);
    }

    // Express middleware for request logging
    requestLogger() {
        return (req, res, next) => {
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                const logData = {
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    duration: `${duration}ms`,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip || req.connection.remoteAddress
                };

                const level = res.statusCode >= 400 ? 'error' : 'info';
                this.log(level, `HTTP ${req.method} ${req.url}`, logData);
            });

            next();
        };
    }

    // Socket.io middleware for connection logging
    socketLogger() {
        return (socket, next) => {
            this.info('Socket connected', {
                socketId: socket.id,
                address: socket.handshake.address
            });

            socket.on('disconnect', (reason) => {
                this.info('Socket disconnected', {
                    socketId: socket.id,
                    reason
                });
            });

            next();
        };
    }

    cleanup() {
        // Rotate logs or perform cleanup if needed
        this.info('Logger cleanup completed');
    }
}

module.exports = new Logger();