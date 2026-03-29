import models from '../../models/index.js';
import { buildUserResponse, comparePassword, generateToken, } from '../../utils/helper/auth.helpers.js';
import { clearLoginFailures, isLoginBlocked, registerLoginFailure } from '../../utils/helper/login_attempts.helpers.js';

export async function userLoginController(req, res) {
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
    if (!user) {
      registerLoginFailure(normalizedEmail, requestIp);
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

    if (user.role !== 'user') {
      registerLoginFailure(normalizedEmail, requestIp);
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

    if (user.provider !== 'microsoft') {
      return res.status(403).json({
        valid: false,
        msg: 'Password login is only available after Microsoft sign-in and password setup.',
      });
    }

    if (user.password_set !== true) {
      return res.status(403).json({
        valid: false,
        msg: 'Password login is only available after Microsoft sign-in and password setup.',
      });
    }

    if (!user.password_hash) {
      return res.status(403).json({
        valid: false,
        msg: 'Password login is only available after Microsoft sign-in and password setup.',
      });
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      registerLoginFailure(normalizedEmail, requestIp);
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

    clearLoginFailures(normalizedEmail, requestIp);

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
