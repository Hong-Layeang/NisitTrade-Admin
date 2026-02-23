import models from '../../models/index.js';

const { User, University } = models;

export default async function currentUserController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at'],
      include: [
        {
          model: University,
          attributes: ['id', 'name', 'domain', 'created_at', 'updated_at']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('currentUser error:', error);
    return res.status(500).json({ msg: 'Internal server error' });
  }
}
