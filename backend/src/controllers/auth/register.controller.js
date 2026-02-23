import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import models from '../../models/index.js';

const PASSWORD_HASH_COST = 12;
const JWT_EXPIRY = '60d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

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

function buildUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    password_set: user.password_set,
  };
}

export default async function registerController(req, res) {
  try {
    const { full_name, email, password, university_id } = req.body;

    if (!full_name || String(full_name).trim() === '') {
      return res.status(400).json({ success: false, msg: 'Full name is required' });
    }

    if (!email || String(email).trim() === '') {
      return res.status(400).json({ success: false, msg: 'Email is required' });
    }

    if (!password) {
      return res.status(400).json({ success: false, msg: 'Password is required' });
    }

    if (!university_id) {
      return res.status(400).json({ success: false, msg: 'University is required' });
    }

    try {
      validatePasswordStrength(password);
    } catch (err) {
      return res.status(400).json({ success: false, msg: err.message });
    }

    const { User, University } = models;
    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ success: false, msg: 'Email already in use' });
    }

    const university = await University.findByPk(university_id);
    if (!university) {
      return res.status(404).json({ success: false, msg: 'University not found' });
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_COST);
    const user = await User.create({
      full_name: String(full_name).trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      password_set: true,
      provider: 'local',
      role: 'user',
      university_id,
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRY }
    );

    return res.status(201).json({
      success: true,
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('register error:', error);
    return res.status(500).json({ success: false, msg: 'Internal server error' });
  }
}
