// Development configuration for frontend
// This file detects the environment and sets appropriate API endpoints

const DEV_CONFIG = {
  // When using separate frontend server (http-server on port 8080)
  API_BASE_URL: 'http://localhost:3000',
  SOCKET_URL: 'http://localhost:3000',
  
  // Development mode indicators
  DEBUG: true,
  LOG_LEVEL: 'debug'
};

const PROD_CONFIG = {
  // When using integrated server (backend serves frontend)
  API_BASE_URL: '',
  SOCKET_URL: '',
  
  // Production mode indicators
  DEBUG: false,
  LOG_LEVEL: 'info'
};

// Auto-detect environment
const isDevelopment = window.location.port === '8080' || window.location.hostname === 'localhost';
const config = isDevelopment ? DEV_CONFIG : PROD_CONFIG;

// Make config available globally
window.APP_CONFIG = config;

// Enhanced logging for development
window.devLog = function(message, ...args) {
  if (config.DEBUG) {
    console.log(`[DEV] ${message}`, ...args);
  }
};

window.devWarn = function(message, ...args) {
  if (config.DEBUG) {
    console.warn(`[DEV] ${message}`, ...args);
  }
};

window.devError = function(message, ...args) {
  if (config.DEBUG) {
    console.error(`[DEV] ${message}`, ...args);
  }
};

console.log('🔧 Development mode:', isDevelopment);
console.log('📡 API Base URL:', config.API_BASE_URL);
console.log('🔌 Socket URL:', config.SOCKET_URL);
