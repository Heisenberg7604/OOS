import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculate paths
// __dirname = C:\Users\HP\Desktop\OOS\backend\middleware
// We want: C:\Users\HP\Desktop\OOS\backend\uploads
const backendRoot = path.dirname(__dirname); // Go up from middleware to backend
const uploadsDir = path.join(backendRoot, 'uploads');

// Log paths for debugging
console.log('📁 Upload middleware initialization:');
console.log('  __dirname:', __dirname);
console.log('  backendRoot:', backendRoot);
console.log('  uploadsDir:', uploadsDir);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
} else {
  console.log('✅ Uploads directory exists:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists and use absolute normalized path
    const absoluteUploadsDir = path.resolve(uploadsDir);
    if (!fs.existsSync(absoluteUploadsDir)) {
      fs.mkdirSync(absoluteUploadsDir, { recursive: true });
    }
    console.log('📤 Multer saving to:', absoluteUploadsDir);
    cb(null, absoluteUploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = config.upload.allowedTypes;
  const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const maxFileSize = config.upload.maxFileSize;
console.log('📦 Multer configuration:');
console.log('  Max file size:', maxFileSize, 'bytes');
console.log('  Max file size:', (maxFileSize / 1024 / 1024).toFixed(2), 'MB');

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${config.upload.maxFileSize / 1024 / 1024}MB.`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed.'
      });
    }
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

