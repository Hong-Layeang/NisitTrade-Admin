import { Op } from 'sequelize';
import models from '../../models/index.js';
import { presignIfS3Url } from '../../utils/s3-presigned-url.js';

const { User, University } = models;

export default async function getAllUsersController(req, res) {
  try {
    const requesterId = req.user?.id;

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { search, limit = 50, offset = 0 } = req.query;

    const where = { role: 'user' };

    if (search && search.trim()) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search.trim()}%` } },
        { email: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'full_name', 'email', 'profile_image', 'role', 'university_id', 'created_at', 'updated_at'],
      include: [
        {
          model: University,
          attributes: ['id', 'name', 'domain'],
        },
      ],
      limit: Math.min(parseInt(limit, 10) || 50, 100),
      offset: parseInt(offset, 10) || 0,
      order: [['full_name', 'ASC']],
    });

    const users = await Promise.all(rows.map(async (user) => ({
      id: user.id,
      full_name: user.full_name,
      profile_image: await presignIfS3Url(user.profile_image),
      role: user.role,
      university_id: user.university_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      University: user.University,
    })));

    res.json({ total: count, items: users });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
}
