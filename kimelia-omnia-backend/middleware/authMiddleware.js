const jwt = require('jsonwebtoken');
    const asyncHandler = require('../utils/asyncHandler');
    const User = require('../models/User');

    /**
     * @function protect
     * @description Middleware to protect routes, ensuring only authenticated users can access them.
     * Verifies the JWT token from the Authorization header.
     * Attaches the authenticated user object (excluding password) to `req.user`.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @throws {Error} 401 Unauthorized if no token, invalid token, or user not found.
     */
    const protect = asyncHandler(async (req, res, next) => {
      let token;

      // Check if Authorization header exists and starts with 'Bearer'
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        try {
          // Extract token from header: "Bearer TOKEN" -> "TOKEN"
          token = req.headers.authorization.split(' ')[1];

          // Verify token using the secret key
          const decoded = jwt.verify(token, process.env.JWT_SECRET);

          // Find user by ID from the token payload and exclude password field
          req.user = await User.findById(decoded.id).select('-password');

          if (!req.user) {
            res.status(401);
            throw new Error('Not authorized, user not found');
          }

          next(); // Proceed to the next middleware/route handler
        } catch (error) {
          console.error('JWT Verification Error:', error.message);
          res.status(401);
          throw new Error('Not authorized, token failed');
        }
      }

      // If no token is provided
      if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
      }
    });

    /**
     * @function authorizeRoles
     * @description Middleware for role-based access control.
     * Checks if the authenticated user's role is included in the allowed roles for the route.
     * @param {...string} roles - A list of allowed roles (e.g., 'admin', 'startup').
     * @returns {Function} An Express middleware function.
     * @throws {Error} 403 Forbidden if user's role is not authorized.
     */
    const authorizeRoles = (...roles) => { // --- RESTORED to 'authorizeRoles' ---
      return (req, res, next) => {
        // Ensure user is authenticated and has a role
        if (!req.user || !req.user.role) {
            res.status(403);
            throw new Error('User role information missing or not authorized.');
        }

        // Check if the user's role is among the allowed roles
        if (!roles.includes(req.user.role)) {
          res.status(403);
          throw new Error(`User role '${req.user.role}' is not authorized to access this route`);
        }
        next(); // User is authorized, proceed
      };
    };

    module.exports = { protect, authorizeRoles }; // --- EXPORT 'authorizeRoles' ---