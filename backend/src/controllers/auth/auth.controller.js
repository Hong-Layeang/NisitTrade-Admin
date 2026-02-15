import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import models from '../../models/index.js';

const PASSWORD_HASH_COST = 12;
const JWT_EXPIRY = '7d';

/**
 * Helper: Get JWT secret from environment
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

/**
 * Helper: Validate password strength
 * Requires: minimum 8 characters, at least one uppercase, one lowercase, one number
 * @param {string} password - Password to validate
 * @throws {Error} if password does not meet strength requirements
 */
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    throw new Error('Password must contain uppercase, lowercase, and numbers');
  }
}

/**
 * Helper: Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, PASSWORD_HASH_COST);
}

/**
 * Helper: Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Helper: Generate JWT token
 * @param {object} payload - Token payload (should include id, role)
 * @param {object} options - Additional options (expiresIn, etc.)
 * @returns {string} JWT token
 */
function generateToken(payload, options = {}) {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: JWT_EXPIRY,
    ...options,
  });
}

/**
 * Helper: Build user response object (exclude sensitive fields)
 * @param {object} user - User model instance
 * @returns {object} Safe user object for response
 */
function buildUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    password_set: user.password_set,
  };
}

/**
 * POST /auth/set-password
 * Set initial password for users who registered via Microsoft
 * Requires: Bearer token with valid user.id and needsPasswordSetup=true
 *
 * @param {object} req - Express request
 * @param {string} req.body.password - New password (validated server-side)
 * @param {object} req.user - Attached by auth middleware (contains id, role)
 * @returns {object} { success, token, user }
 */
export async function setPasswordController(req, res) {
  try {
    const { password } = req.body;

    // Validate password input
    if (!password) {
      return res.status(400).json({ success: false, msg: 'Password is required' });
    }

    // Verify user from middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, msg: 'Unauthorized' });
    }

    // Fetch user from database
    const { User } = models;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    // Prevent overwriting existing password
    if (user.password_set === true) {
      return res.status(400).json({ success: false, msg: 'Password already set' });
    }

    // Validate password strength server-side
    try {
      validatePasswordStrength(password);
    } catch (err) {
      return res.status(400).json({ success: false, msg: err.message });
    }

    // Hash and store password
    const passwordHash = await hashPassword(password);
    user.password_hash = passwordHash;
    user.password_set = true;
    // Ensure provider is set (default to 'local' if not already set)
    if (!user.provider) {
      user.provider = 'local';
    }
    await user.save();

    // Generate new JWT without needsPasswordSetup flag
    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return res.json({
      success: true,
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('setPassword error:', error);
    return res.status(500).json({ success: false, msg: 'Internal server error' });
  }
}

/**
 * POST /auth/login
 * Standard user login (email + password)
 * Only for users with role='user' and password_set=true
 *
 * @param {object} req - Express request
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @returns {object} { valid, token, user }
 */
export async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ valid: false, msg: 'Email and password are required' });
    }

    // Find user by email
    const { User } = models;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

    // Ensure user role is 'user' (not admin)
    if (user.role !== 'user') {
      return res.status(403).json({ valid: false, msg: 'Use admin login for admin accounts' });
    }

    // Require password to be set
    if (user.password_set !== true) {
      return res.status(409).json({
        valid: false,
        msg: 'Please complete Microsoft registration to set password',
      });
    }

    // Compare password with stored hash
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return res.json({
      valid: true,
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('userLogin error:', error);
    return res.status(500).json({ valid: false, msg: 'Internal server error' });
  }
}

/**
 * POST /auth/admin/login
 * Admin-only login (email + password)
 * Only for users with role='admin'
 *
 * @param {object} req - Express request
 * @param {string} req.body.email - Admin email
 * @param {string} req.body.password - Admin password
 * @returns {object} { valid, token, user }
 */
export async function adminLoginController(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ valid: false, msg: 'Email and password are required' });
    }

    // Find user by email
    const { User } = models;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    // Check if user exists and is admin
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ valid: false, msg: 'Invalid admin credentials' });
    }

    // Admins must have password set
    if (user.password_set !== true) {
      return res.status(401).json({ valid: false, msg: 'Invalid admin credentials' });
    }

    // Compare password with stored hash
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ valid: false, msg: 'Invalid admin credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      role: 'admin',
    });

    return res.json({
      valid: true,
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('adminLogin error:', error);
    return res.status(500).json({ valid: false, msg: 'Internal server error' });
  }
}
