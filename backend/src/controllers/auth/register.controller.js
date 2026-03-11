import models from '../../models/index.js';
import { buildUserResponse, generateToken, hashPassword, validatePasswordStrength, } from '../../utils/helper/auth.helpers.js';

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

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      full_name: String(full_name).trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      password_set: true,
      provider: 'local',
      role: 'user',
      university_id,
    });

    const token = generateToken({ id: user.id, role: user.role });

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
