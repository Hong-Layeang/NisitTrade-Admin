import { Op, fn, col } from 'sequelize';
import models from '../../models/index.js';
import { presignIfS3Url } from '../../utils/s3-presigned-url.js';

const { User, University, UserFollow } = models;

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

    const userIds = rows.map((user) => user.id);

    const [followRows, followerCountsRaw, followingCountsRaw] = await Promise.all([
      userIds.length
        ? UserFollow.findAll({
            where: {
              follower_id: requesterId,
              following_id: { [Op.in]: userIds },
            },
            attributes: ['following_id'],
            raw: true,
          })
        : Promise.resolve([]),
      userIds.length
        ? UserFollow.findAll({
            where: { following_id: { [Op.in]: userIds } },
            attributes: [
              'following_id',
              [fn('COUNT', col('following_id')), 'count'],
            ],
            group: ['following_id'],
            raw: true,
          })
        : Promise.resolve([]),
      userIds.length
        ? UserFollow.findAll({
            where: { follower_id: { [Op.in]: userIds } },
            attributes: [
              'follower_id',
              [fn('COUNT', col('follower_id')), 'count'],
            ],
            group: ['follower_id'],
            raw: true,
          })
        : Promise.resolve([]),
    ]);

    const followingIds = new Set(followRows.map((row) => row.following_id));
    const followerCountByUserId = new Map(
      followerCountsRaw.map((row) => [
        Number(row.following_id),
        Number.parseInt(String(row.count), 10) || 0,
      ]),
    );
    const followingCountByUserId = new Map(
      followingCountsRaw.map((row) => [
        Number(row.follower_id),
        Number.parseInt(String(row.count), 10) || 0,
      ]),
    );

    const users = await Promise.all(rows.map(async (user) => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      profile_image: await presignIfS3Url(user.profile_image),
      role: user.role,
      university_id: user.university_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      University: user.University,
      follower_count: followerCountByUserId.get(user.id) ?? 0,
      following_count: followingCountByUserId.get(user.id) ?? 0,
      is_following: user.id === requesterId ? false : followingIds.has(user.id),
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
