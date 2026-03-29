import models from '../../models/index.js';

import { buildUserResponse, comparePassword, generateToken, } from '../../utils/helper/auth.helpers.js';
import { clearLoginFailures, isLoginBlocked, registerLoginFailure } from '../../utils/helper/login_attempts.helpers.js';

export async function adminLoginController(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const requestIp = req.ip || req.socket?.remoteAddress || '';

    if (!email || !password) {
      return res.status(400).json({ valid: false, msg: 'Email and password are required' });
    }

    const blockStatus = isLoginBlocked(normalizedEmail, requestIp);
    if (blockStatus.blocked) {
      return res.status(429).json({
        valid: false,
        msg: 'Too many failed login attempts. Please try again later.',
      });
    }

    const { User } = models;
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user || user.role !== 'admin') {
      registerLoginFailure(normalizedEmail, requestIp);
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

    if (user.password_set !== true) {
      registerLoginFailure(normalizedEmail, requestIp);
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      registerLoginFailure(normalizedEmail, requestIp);
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

    clearLoginFailures(normalizedEmail, requestIp);

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
