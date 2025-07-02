class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  info(message, meta = {}) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta);
    }
  }

  error(message, meta = {}) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, meta);
  }

  warn(message, meta = {}) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta);
    }
  }

  debug(message, meta = {}) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, meta);
    }
  }
}

module.exports = new Logger();
