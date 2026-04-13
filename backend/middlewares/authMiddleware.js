const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Adjust path as needed

// Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';

// Error messages
const ERROR_MESSAGES = {
  NO_TOKEN: 'Authentication required. No token provided.',
  INVALID_TOKEN_FORMAT: 'Authentication required. Invalid token format.',
  TOKEN_EXPIRED: 'Token expired. Please login again.',
  INVALID_TOKEN: 'Invalid token. Authentication failed.',
  USER_NOT_FOUND: 'User not found. Please login again.',
  USER_INACTIVE: 'User account is inactive. Please contact support.',
  INSUFFICIENT_PERMISSIONS: 'Access denied. Insufficient permissions.',
  AUTHENTICATION_REQUIRED: 'Authentication required.',
  INVALID_JWT_SECRET: 'JWT secret not configured properly.'
};

/**
 * Extract token from request headers
 * @param {Object} req - Express request object
 * @returns {string|null} - JWT token or null
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Support multiple token formats
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7); // Remove 'Bearer ' prefix
  }
  
  if (authHeader.startsWith('Token ')) {
    return authHeader.slice(6); // Remove 'Token ' prefix
  }
  
  // If no prefix, assume the entire header is the token
  return authHeader;
};

/**
 * Verify JWT token and return decoded payload
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error(ERROR_MESSAGES.INVALID_JWT_SECRET);
  }

  return jwt.verify(token, JWT_SECRET, { algorithm: JWT_ALGORITHM });
};

/**
 * Main authentication middleware
 * Verifies JWT token and attaches user data to request
 * @param {Object} options - Configuration options
 * @param {boolean} options.optional - If true, doesn't fail if no token provided
 * @param {boolean} options.fetchUser - If true, fetches full user data from database
 */
const authenticate = (options = {}) => {
  const { optional = false, fetchUser = false } = options;

  return async (req, res, next) => {
    try {
      const token = extractToken(req);

      // Handle optional authentication
      if (!token && optional) {
        req.user = null;
        return next();
      }

      // Require token if not optional
      if (!token) {
        return res.status(401).json({
          success: false,
          message: ERROR_MESSAGES.NO_TOKEN,
          code: 'NO_TOKEN'
        });
      }

      // Verify token
      let decoded;
      try {
        decoded = verifyToken(token);
      } catch (error) {
        let message = ERROR_MESSAGES.INVALID_TOKEN;
        let code = 'INVALID_TOKEN';

        if (error.name === 'TokenExpiredError') {
          message = ERROR_MESSAGES.TOKEN_EXPIRED;
          code = 'TOKEN_EXPIRED';
        } else if (error.name === 'JsonWebTokenError') {
          message = ERROR_MESSAGES.INVALID_TOKEN;
          code = 'INVALID_TOKEN';
        } else if (error.message === ERROR_MESSAGES.INVALID_JWT_SECRET) {
          console.error('JWT_SECRET not configured properly');
          message = 'Internal server error';
          code = 'SERVER_ERROR';
        }

        return res.status(401).json({
          success: false,
          message,
          code
        });
      }

      // Fetch full user data if requested
      if (fetchUser && decoded.userId) {
        try {
          const user = await User.findById(decoded.userId).select('-password');
          
          if (!user) {
            return res.status(401).json({
              success: false,
              message: ERROR_MESSAGES.USER_NOT_FOUND,
              code: 'USER_NOT_FOUND'
            });
          }

          // Check if user is active (if your User model has isActive field)
          if (user.isActive === false) {
            return res.status(401).json({
              success: false,
              message: ERROR_MESSAGES.USER_INACTIVE,
              code: 'USER_INACTIVE'
            });
          }

          req.user = user;
        } catch (dbError) {
          console.error('Database error in authentication:', dbError);
          return res.status(500).json({
            success: false,
            message: 'Internal server error',
            code: 'DATABASE_ERROR'
          });
        }
      } else {
        // Use token payload data
        req.user = decoded;
      }

      next();
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication service error',
        code: 'AUTH_SERVICE_ERROR'
      });
    }
  };
};

/**
 * Role-based authorization middleware
 * @param {string|string[]} allowedRoles - Role(s) that can access the route
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireOwnership - Check if user owns the resource
 * @param {string} options.ownershipField - Field to check for ownership (default: 'userId')
 */
const authorize = (allowedRoles, options = {}) => {
  const { requireOwnership = false, ownershipField = 'userId' } = options;

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: ERROR_MESSAGES.AUTHENTICATION_REQUIRED,
          code: 'AUTHENTICATION_REQUIRED'
        });
      }

      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const userRole = req.user.role;
      const hasRequiredRole = rolesArray.includes(userRole);

      // Check ownership if needed
      let hasOwnership = true;
      if (requireOwnership && !hasRequiredRole) {
        const resourceOwnerId = req.params[ownershipField] || req.body[ownershipField];
        const userId = req.user.userId || req.user._id || req.user.id;
        hasOwnership = resourceOwnerId && resourceOwnerId.toString() === userId.toString();
      }

      // Allow if role matches or user owns the resource
      if (hasRequiredRole || (requireOwnership && hasOwnership)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `${ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS} Required role(s): ${rolesArray.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: rolesArray,
        userRole: userRole
      });

    } catch (error) {
      console.error('Authorization middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization service error',
        code: 'AUTH_SERVICE_ERROR'
      });
    }
  };
};



/**
 * Middleware to check if user owns a resource
 * @param {string} resourceModel - Mongoose model name
 * @param {string} resourceIdParam - Parameter name for resource ID (default: 'id')
 * @param {string} ownerField - Field name that contains owner ID (default: 'ownerId')
 */
const checkOwnership = (resourceModel, resourceIdParam = 'id', ownerField = 'ownerId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: ERROR_MESSAGES.AUTHENTICATION_REQUIRED,
          code: 'AUTHENTICATION_REQUIRED'
        });
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.userId || req.user._id || req.user.id;

      // Skip ownership check for admin
      if (req.user.role === 'admin') {
        return next();
      }

      // Dynamically require the model
      const Model = require(`../models/${resourceModel}`);
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      // Check ownership
      const resourceOwnerId = resource[ownerField];
      if (resourceOwnerId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.',
          code: 'OWNERSHIP_REQUIRED'
        });
      }

      // Attach resource to request for potential use in controller
      req.resource = resource;
      next();

    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Ownership verification error',
        code: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

/**
 * Convenience middleware combinations for your specific roles:
 * admin, user, ownerStadium, referee, teamLeader
 */
const authMiddleware = {
  // Basic authentication
  auth: authenticate(),
  
  // Optional authentication (for public routes that can benefit from user data)
  optionalAuth: authenticate({ optional: true }),
  
  // Authentication with full user data fetch
  authWithUser: authenticate({ fetchUser: true }),
  
  // Single role access
  admin: [authenticate(), authorize('admin')],
  user: [authenticate(), authorize('user')],
  stadiumOwner: [authenticate(), authorize('stadiumOwner')],
  referee: [authenticate(), authorize('referee')],
  teamLeader: [authenticate(), authorize('teamLeader')],
  academyOwner: [authenticate(), authorize('academyOwner')],
  
  // Common role combinations
  adminOrOwner: [authenticate(), authorize(['admin', 'stadiumOwner'])],
  adminOrReferee: [authenticate(), authorize(['admin', 'referee'])],
  adminOrTeamLeader: [authenticate(), authorize(['admin', 'teamLeader'])],
  
  // Stadium management roles
  stadiumManagers: [authenticate(), authorize(['admin', 'stadiumOwner'])],
  
  // Sports management roles
  sportsManagers: [authenticate(), authorize(['admin', 'referee', 'teamLeader'])],
  
  // All authenticated users
  authenticated: [authenticate(), authorize(['admin', 'user', 'stadiumOwner', 'referee', 'teamLeader', 'academyOwner'])],
  
  // Elevated privileges (admin + specialized roles)
  elevated: [authenticate(), authorize(['admin', 'stadiumOwner', 'referee', 'teamLeader'])],
  
  // Custom role checker
  role: (roles) => [authenticate(), authorize(roles)],
  
  // Resource ownership checker
  owns: (model, idParam, ownerField) => [
    authenticate(), 
    checkOwnership(model, idParam, ownerField)
  ]
};

module.exports = {
  authenticate,
  authorize,
  checkOwnership,
  authMiddleware,
  ERROR_MESSAGES
};