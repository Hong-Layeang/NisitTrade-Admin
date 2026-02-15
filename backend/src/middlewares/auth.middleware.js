import jwt from 'jsonwebtoken';

/**
 * Auth Middleware
 * Verifies server JWT token from Authorization header
 * Attaches decoded payload to req.user for downstream handlers
 */

/**
 * Middleware: Verify JWT and attach user to request
 * Header format: Authorization: Bearer <server_jwt>
 * On success: req.user = { id, role, ... }
 * On failure: 401 Unauthorized
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next middleware
 * @returns {void}
 */
export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ msg: 'Internal server error' });
    }

    // Verify token and extract payload
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Contains: id, role, and optional flags like needsPasswordSetup
    return next();
  } catch (error) {
    // Handle expired tokens, invalid signatures, etc.
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Invalid token' });
    }
    return res.status(401).json({ msg: 'Invalid token' });
  }
}

/**
 * Middleware: Verify user has required role
 * Must be used after authMiddleware
 * Returns 403 Forbidden if role does not match
 *
 * @param {string|string[]} requiredRole - Single role or array of allowed roles
 * @returns {function} Express middleware function
 */
export function requireRole(requiredRole) {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'No user attached to request' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Insufficient permissions' });
    }

    return next();
  };
}
