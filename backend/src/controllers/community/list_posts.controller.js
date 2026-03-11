import models from '../../models/index.js';
import { Op } from 'sequelize';
import serializeCommunityPost from './serialize_post.js';

const { CommunityPost, CommunityPostLike, User, University, UserFollow } = models;

export default async function listCommunityPostsController(req, res) {
  try {
    const { limit = 20, offset = 0, feed = 'community' } = req.query;
    const requesterId = req.user?.id;

    // Filter by university: show posts from users in the same university
    const requester = await User.findByPk(requesterId, {
      attributes: ['university_id'],
    });

    const userWhere = {};

    if (feed === 'following' && requesterId) {
      const follows = await UserFollow.findAll({
        where: { follower_id: requesterId },
        attributes: ['following_id'],
      });

      const followingIds = follows.map((row) => row.following_id);
      userWhere.id = {
        [Op.in]: [...new Set([requesterId, ...followingIds])],
      };
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
          model: CommunityPostLike,
          where: requesterId ? { user_id: requesterId } : undefined,
          required: false,
          attributes: ['id', 'user_id', 'community_post_id'],
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
