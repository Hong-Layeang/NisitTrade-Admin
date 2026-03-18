import models from '../../models/index.js';
import serializeCommunityPost from '../community/serialize_post.js';

const {
  SavedItem,
  CommunityPost,
  Like,
  User,
  University,
} = models;

export default async function getUserSavedCommunityPostsController(req, res) {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const requesterId = req.user?.id;

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (String(requesterId) !== String(id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Get saved items for this user that are community posts
    const savedItems = await SavedItem.findAll({
      where: { user_id: id, saveable_type: 'CommunityPost' },
      order: [['created_at', 'DESC']],
      limit: Math.min(parseInt(limit, 10), 100),
      offset: parseInt(offset, 10),
      raw: true,
    });

    // Fetch the actual community posts
    const postIds = savedItems.map(item => item.saveable_id);
    const communityPosts = await CommunityPost.findAll({
      where: { id: postIds },
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'role', 'university_id', 'created_at', 'updated_at'],
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
          where: requesterId ? { user_id: requesterId } : undefined,
          required: false,
          attributes: ['id', 'user_id', 'likeable_id'],
        },
        {
          model: SavedItem,
          as: 'SavedItems',
          where: requesterId ? { user_id: requesterId } : undefined,
          required: false,
          attributes: ['id', 'user_id', 'saveable_id'],
        },
      ],
    });

    const posts = await Promise.all(
      communityPosts
        .map(post => serializeCommunityPost(post)),
    );

    return res.status(200).json({ count: posts.length, posts });
  } catch (error) {
    console.error('getUserSavedCommunityPostsController error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
