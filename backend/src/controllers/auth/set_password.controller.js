import models from '../../models/index.js';

import { buildUserResponse, generateToken, hashPassword, validatePasswordStrength, } from '../../utils/helper/auth.helpers.js';

export async function setPasswordController(req, res) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, msg: 'Password is required' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, msg: 'Unauthorized' });
    }

    const { User } = models;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({ success: false, msg: 'Unauthorized' });
    }

    if (user.password_set === true) {
      return res.status(400).json({ success: false, msg: 'Password already set' });
    }

    try {
      validatePasswordStrength(password);
    } catch (err) {
      return res.status(400).json({ success: false, msg: err.message });
    }

    const passwordHash = await hashPassword(password);
    user.password_hash = passwordHash;
    user.password_set = true;
    if (!user.provider) {
      user.provider = 'local';
    }
    await user.save();

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
