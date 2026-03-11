import models from '../../models/index.js';
import serializeCommunityPost from './serialize_post.js';

const {
  CommunityPost,
  CommunityPostLike,
  SavedCommunityPost,
  CommunityPostComment,
  User,
  University,
} = models;

export default async function getCommunityPostController(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    const post = await CommunityPost.findByPk(postId, {
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
          where: userId ? { user_id: userId } : undefined,
          required: false,
          attributes: ['id', 'user_id', 'community_post_id', 'created_at'],
        },
        {
          model: SavedCommunityPost,
          where: userId ? { user_id: userId } : undefined,
          required: false,
          attributes: ['id', 'user_id', 'community_post_id', 'created_at'],
        },
        {
          model: CommunityPostComment,
          attributes: ['id', 'content', 'user_id', 'community_post_id', 'created_at', 'updated_at'],
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
          ],
          separate: true,
          order: [['created_at', 'DESC']],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const serialized = await serializeCommunityPost(post, {
      includeComments: true,
    });

    return res.status(200).json(serialized);
  } catch (err) {
    console.error('getCommunityPostController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}