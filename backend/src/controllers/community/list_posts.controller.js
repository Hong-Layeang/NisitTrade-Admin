import models from '../../models/index.js';
import { Op } from 'sequelize';
import serializeCommunityPost from './serialize_post.js';

const {
  CommunityPost,
  Like,
  SavedItem,
  User,
  University,
  UserFollow,
} = models;

export default async function listCommunityPostsController(req, res) {
  try {
    const { limit = 20, offset = 0, feed = 'community', user_id: userIdParam } = req.query;
    const requesterId = req.user?.id;
    const targetUserId = Number.parseInt(userIdParam, 10);

    if (userIdParam !== undefined && Number.isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user_id query parameter' });
    }

    // Filter by university: show posts from users in the same university
    const requester = await User.findByPk(requesterId, {
      attributes: ['university_id'],
    });

    const userWhere = {};

    if (!Number.isNaN(targetUserId)) {
      userWhere.id = targetUserId;
    } else if (feed === 'following' && requesterId) {
      const follows = await UserFollow.findAll({
        where: { follower_id: requesterId },
        attributes: ['following_id'],
      });

      const followingIds = follows.map((row) => row.following_id);
      userWhere.id = {
        [Op.in]: [...new Set([requesterId, ...followingIds])],
      };

      if (requester?.university_id) {
        userWhere.university_id = requester.university_id;
      }
    } else if (requester?.university_id) {
      userWhere.university_id = requester.university_id;
    }

    const posts = await CommunityPost.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'role', 'university_id', 'created_at', 'updated_at'],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
          include: [
            {
              model: University,
              attributes: ['id', 'name', 'domain'],
            },
          ],
        },
        {
          model: Like,
          as: 'Likes',
          where: {
            likeable_type: 'CommunityPost',
            ...(requesterId ? { user_id: requesterId } : {})
          },
          required: false,
          attributes: ['id', 'user_id', 'likeable_id', 'likeable_type'],
        },
        {
          model: SavedItem,
          as: 'SavedItems',
          where: requesterId ? { user_id: requesterId } : undefined,
          required: false,
          attributes: ['id', 'user_id', 'saveable_id', 'saveable_type'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: Math.min(parseInt(limit, 10), 50),
      offset: parseInt(offset, 10),
    });

    const enrichedPosts = await Promise.all(posts.map((post) => serializeCommunityPost(post)));

    return res.status(200).json(enrichedPosts);
  } catch (err) {
    console.error('listCommunityPostsController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
