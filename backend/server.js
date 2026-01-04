import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes
import uploadRoutes from './routes/upload.js';
import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import userProductRoutes from './routes/userProducts.js';
import orderRoutes from './routes/orders.js';

// Import database
import { initializeDatabase } from './models/index.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());

// Rate limiting - configurable via environment variables
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX) || 10000, // 1000 requests per window default (increased for production)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://spares.jpel.in/' || 'http://spares.jpel.in/',
  credentials: true
}));

// Body parsing middleware - increased for file uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create public directory for serving product images
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create product-images directory
const productImagesDir = path.join(publicDir, 'product-images');
if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}

// Create data directory for JSON storage
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Serve static files from public directory
app.use('/product-images', express.static(productImagesDir));
app.use(express.static(publicDir)); // Serve all public files
console.log('📁 Serving product images from:', productImagesDir);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// CRITICAL: Add logging before upload routes - THIS MUST SHOW
app.use('/api/upload', (req, res, next) => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 CHECKPOINT SERVER: /api/upload route hit!');
  console.log('🔍 CHECKPOINT SERVER.1: Method:', req.method);
  console.log('🔍 CHECKPOINT SERVER.2: Path:', req.path);
  console.log('🔍 CHECKPOINT SERVER.3: Timestamp:', new Date().toISOString());
  console.log('═══════════════════════════════════════════════════════');
  next();
});

app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user-products', userProductRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'OOS Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 100MB.'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('❌ Failed to initialize database. Exiting...');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🚀 Server running on port', PORT);
      console.log('🔍 CHECKPOINT SERVER: NEW CODE WITH CHECKPOINTS LOADED!');
      console.log('🔍 CHECKPOINT SERVER: All checkpoints are ACTIVE');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: MySQL connected successfully`);
      console.log(`📤 File upload limit: ${(process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 104857600) / 1024 / 1024}MB`);
      console.log('═══════════════════════════════════════════════════════');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
