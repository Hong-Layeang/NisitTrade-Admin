import jwt from 'jsonwebtoken';

import models from '../../models/index.js';
import {
  jwtVerifyMicrosoftIdToken,
  getAllowedDomains,
  getMicrosoftConfig,
  extractEmail,
  extractFullName,
  normalizeEmail,
  isAllowedDomain,
} from '../../utils/helper/ms.helpers.js';

const TOKEN_EXPIRY = '7d';

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
 * Helper: Generate JWT token
 */
function generateToken(payload) {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Helper: Build user response object
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
 * POST /auth/microsoft
 * Microsoft Azure AD OAuth2 flow
 * Validates idToken from client, creates/finds user, returns server JWT
 *
 * Body: { idToken: "<client_idToken>" }
 * Response: { valid, token, user, needsPasswordSetup }
 *
 * Business rules:
 * - Verify idToken against Microsoft JWKS (validate iss, aud, exp)
 * - Extract email, check domain is allowed
 * - Prevent admin accounts from using this flow (return 403)
 * - Create user if first login, set provider='microsoft', password_set=false
 * - Return server JWT with needsPasswordSetup flag for client
 *
 * @param {object} req - Express request
 * @param {string} req.body.idToken - Microsoft ID token from client
 * @returns {object} { valid, token, user, needsPasswordSetup } or error
 */
export default async function microsoftValidateController(req, res) {
  try {
    const idToken = req?.body?.idToken;
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ valid: false, msg: 'Invalid request' });
    }

    // Get Microsoft configuration
    let tenantId, clientId;
    try {
      ({ tenantId, clientId } = getMicrosoftConfig());
    } catch (err) {
      console.error('Microsoft config error:', err.message);
      return res.status(500).json({ valid: false, msg: 'Internal server error' });
    }

    // Verify idToken against Microsoft JWKS
    let msPayload;
    try {
      msPayload = await jwtVerifyMicrosoftIdToken(idToken, tenantId, clientId);
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ valid: false, msg: 'Authentication failed' });
    }

    // Extract and normalize email
    const rawEmail = extractEmail(msPayload);
    if (!rawEmail) {
      return res.status(401).json({ valid: false, msg: 'Authentication failed' });
    }
    const email = normalizeEmail(rawEmail);

    // Check domain is allowed
    const allowedDomains = getAllowedDomains();
    if (allowedDomains.length && !isAllowedDomain(email, allowedDomains)) {
      return res.status(403).json({ valid: false, msg: 'Authentication failed' });
    }

    // Find or create user
    const { User } = models;
    let user = await User.findOne({ where: { email } });

    // Prevent admin accounts from using Microsoft login
    if (user && user.role === 'admin') {
      return res.status(403).json({ valid: false, msg: 'Authentication failed' });
    }

    // Create user if first login
    if (!user) {
      const fullName = extractFullName(msPayload, email);
      user = await User.create({
        email,
        full_name: fullName,
        provider: 'microsoft',
        role: 'user',
        password_hash: null,
        password_set: false,
      });
    }

    // Determine if password setup is needed
    const needsPasswordSetup = !user.password_set;

    // Generate server JWT (includes needsPasswordSetup flag)
    let token;
    try {
      token = generateToken({
        id: user.id,
        role: user.role,
        needsPasswordSetup,
      });
    } catch (err) {
      console.error('Token generation error:', err.message);
      return res.status(500).json({ valid: false, msg: 'Internal server error' });
    }

    return res.json({
      valid: true,
      token,
      user: buildUserResponse(user),
      needsPasswordSetup,
    });
  } catch (error) {
    console.error('microsoftValidate error:', error);
    return res.status(500).json({ valid: false, msg: 'Internal server error' });
  }
}
