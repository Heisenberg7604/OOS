import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { config } from '../config.js';

export const authenticateToken = async (req, res, next) => {
  console.log('🔍 CHECKPOINT AUTH: authenticateToken middleware called');
  console.log('🔍 CHECKPOINT AUTH.1: Request path:', req.path);
  console.log('🔍 CHECKPOINT AUTH.2: Request method:', req.method);
  try {
    const authHeader = req.headers['authorization'];
    console.log('🔍 CHECKPOINT AUTH.3: Has authorization header?', !!authHeader);
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    console.log('🔍 CHECKPOINT AUTH.4: Has token?', !!token);

    if (!token) {
      console.log('🔍 CHECKPOINT AUTH.5: No token found, returning 401');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Get fresh user data from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export const requireAdmin = (req, res, next) => {
  console.log('🔍 CHECKPOINT AUTH: requireAdmin middleware called');
  console.log('🔍 CHECKPOINT AUTH.6: Has user?', !!req.user);
  console.log('🔍 CHECKPOINT AUTH.7: User role:', req.user ? req.user.role : 'N/A');
  if (!req.user || req.user.role !== 'admin') {
    console.log('🔍 CHECKPOINT AUTH.8: Admin check failed, returning 403');
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  console.log('🔍 CHECKPOINT AUTH.9: Admin check passed, calling next()');
  next();
};

export const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

// Optional authentication - doesn't fail if no token, but sets req.user if valid token provided
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Get fresh user data from database
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        };
      } else {
        req.user = null;
      }
    } catch (tokenError) {
      // Invalid or expired token, continue without authentication
      req.user = null;
    }
    
    next();
  } catch (error) {
    // On any error, continue without authentication
    req.user = null;
    next();
  }
};
