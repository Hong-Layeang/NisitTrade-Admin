import models from '../../models/index.js';
import serializeCommunityPost from '../community/serialize_post.js';

const {
  SavedCommunityPost,
  CommunityPost,
  CommunityPostLike,
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

    const savedRows = await SavedCommunityPost.findAll({
      where: { user_id: id },
      include: [
        {
          model: CommunityPost,
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
              model: CommunityPostLike,
              where: { user_id: requesterId },
              required: false,
              attributes: ['id', 'user_id', 'community_post_id'],
            },
            {
              model: SavedCommunityPost,
              where: { user_id: requesterId },
              required: false,
              attributes: ['id', 'user_id', 'community_post_id'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: Math.min(parseInt(limit, 10), 100),
      offset: parseInt(offset, 10),
    });

    const posts = await Promise.all(
      savedRows
        .filter(row => row.CommunityPost)
        .map(row => serializeCommunityPost(row.CommunityPost)),
    );

    return res.status(200).json({ count: posts.length, posts });
  } catch (error) {
    console.error('getUserSavedCommunityPostsController error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
