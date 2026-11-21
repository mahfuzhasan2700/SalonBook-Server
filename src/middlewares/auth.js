import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token from Authorization header
export const verifyToken = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'salonbook_jwt_super_secret_key_2026');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.',
    });
  }
};

// Check if user is blocked
export const checkBlocked = (req, res, next) => {
  if (req.user && req.user.isBlocked) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been suspended by the salon administration.',
    });
  }
  next();
};

// Verify Admin role
export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Administrator privileges required.',
    });
  }
  next();
};

// Verify Customer role
export const verifyCustomer = (req, res, next) => {
  if (!req.user || req.user.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Only registered customers can perform this action.',
    });
  }
  next();
};
