import models from '../../models/index.js';

const { CommunityPost, Comment, User, University } = models;

export default async function createCommunityCommentController(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    const content = req.body?.content?.trim() ?? '';

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: 'Comment must be 500 characters or less' });
    }

    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const comment = await Comment.create({
      commentable_type: 'CommunityPost',
      commentable_id: post.id,
      user_id: userId,
      content,
    });

    await post.increment('comments_count', { by: 1 });

    await comment.reload({
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
    });

    return res.status(201).json(comment);
  } catch (err) {
    console.error('createCommunityCommentController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}