import dotenv from 'dotenv';

dotenv.config();

// Debug: Log MAX_FILE_SIZE env variable
console.log('🔍 Environment check:');
console.log('  MAX_FILE_SIZE from env:', process.env.MAX_FILE_SIZE || 'not set');
console.log('  Default will be 100MB (104857600 bytes)');

export const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'oos_database',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  upload: {
    maxFileSize: (() => {
      const envValue = process.env.MAX_FILE_SIZE;
      if (envValue) {
        const parsed = parseInt(envValue);
        console.log('  Using MAX_FILE_SIZE from .env:', parsed, 'bytes (' + (parsed / 1024 / 1024).toFixed(2) + 'MB)');
        return parsed;
      }
      const defaultSize = 104857600; // 100MB
      console.log('  Using default MAX_FILE_SIZE:', defaultSize, 'bytes (' + (defaultSize / 1024 / 1024).toFixed(2) + 'MB)');
      return defaultSize;
    })(),
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'xlsx,xls,csv').split(',')
  }
};
