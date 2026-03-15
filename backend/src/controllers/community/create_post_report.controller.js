import models from '../../models/index.js';

const { CommunityPost, Report } = models;

export default async function createCommunityPostReportController(req, res) {
  try {
    const { postId } = req.params;
    const { reason, details } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    if (Number(post.user_id) === Number(userId)) {
      return res.status(400).json({ message: 'You cannot report your own post' });
    }

    const report = await Report.create({
      user_id: userId,
      reportable_type: 'CommunityPost',
      reportable_id: postId,
      reason: reason.trim(),
      details: details?.trim() || null,
    });

    return res.status(201).json(report);
  } catch (err) {
    console.error('createCommunityPostReportController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
