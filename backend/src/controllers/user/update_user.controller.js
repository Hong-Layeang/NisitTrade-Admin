import models from '../../models/index.js';

const { User, University } = models;

export default async function updateUserController(req, res) {
  try {
    const { id } = req.params;
    const { full_name, email, university_id } = req.body;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (String(requesterId) !== String(id) && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};

    if (full_name !== undefined) {
      if (String(full_name).trim() === '') {
        return res.status(400).json({ message: 'Full name cannot be empty' });
      }
      updates.full_name = String(full_name).trim();
    }

    if (email !== undefined) {
      if (String(email).trim() === '') {
        return res.status(400).json({ message: 'Email cannot be empty' });
      }
      updates.email = String(email).trim().toLowerCase();
    }

    if (university_id !== undefined) {
      if (!university_id) {
        return res.status(400).json({ message: 'University is required' });
      }

      const university = await University.findByPk(university_id);
      if (!university) {
        return res.status(404).json({ message: 'University not found' });
      }

      updates.university_id = university_id;
    }

    await user.update(updates);

    const updatedUser = await User.findByPk(id, {
      attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at'],
      include: [
        {
          model: University,
          attributes: ['id', 'name', 'domain', 'created_at', 'updated_at']
        }
      ]
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      message: 'Failed to update user',
      error: error.message
    });
  }
}
