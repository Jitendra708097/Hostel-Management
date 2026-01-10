/**
 * Logger utility - logs only in development
 * Use instead of console.log to avoid data leaks in production
 */

// Check if running in development mode (Vite uses import.meta.env)
const isDevelopment = 
  import.meta.env.DEV || 
  import.meta.env.VITE_NODE_ENV === 'development' ||
  import.meta.env.MODE === 'development';

const logger = {
  info: (label, data) => {
    if (isDevelopment) {
      console.log(`%c[INFO] ${label}`, 'color: #0066cc; font-weight: bold;', data);
    }
  },

  warn: (label, data) => {
    if (isDevelopment) {
      console.warn(`%c[WARN] ${label}`, 'color: #ff9900; font-weight: bold;', data);
    }
  },

  error: (label, data) => {
    if (isDevelopment) {
      console.error(`%c[ERROR] ${label}`, 'color: #cc0000; font-weight: bold;', data);
    }
  },

  success: (label, data) => {
    if (isDevelopment) {
      console.log(`%c[SUCCESS] ${label}`, 'color: #00aa00; font-weight: bold;', data);
    }
  },

  api: (method, url, status, data) => {
    if (isDevelopment) {
      const color = status >= 400 ? '#cc0000' : '#00aa00';
      console.log(
        `%c[${method}] ${url} (${status})`,
        `color: ${color}; font-weight: bold;`,
        data
      );
    }
  }
};

export default logger;
