import models from '../../models/index.js';
import { buildUserResponse, comparePassword, generateToken, } from '../../utils/helper/auth.helpers.js';

export async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ valid: false, msg: 'Email and password are required' });
    }

    const { User } = models;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

    if (user.role !== 'user') {
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

    if (user.password_set !== true) {
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ valid: false, msg: 'Invalid credentials' });
    }

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
