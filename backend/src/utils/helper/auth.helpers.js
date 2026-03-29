import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const PASSWORD_HASH_COST = 12;
const DEFAULT_JWT_EXPIRY = '1d';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

export function validatePasswordStrength(password) {
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

export async function hashPassword(password) {
  return bcrypt.hash(password, PASSWORD_HASH_COST);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload, options = {}) {
  const secret = getJwtSecret();
  const jwtExpiry = process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRY;
  return jwt.sign(payload, secret, {
    expiresIn: jwtExpiry,
    ...options,
  });
}

export function buildUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    password_set: user.password_set,
  };
}
