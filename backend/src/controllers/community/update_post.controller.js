import models from '../../models/index.js';

const { CommunityPost } = models;

export default async function updateCommunityPostController(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const content = req.body?.content?.trim() ?? '';
    const uploadedImageKeys = Array.isArray(req.files)
      ? req.files.map((file) => file.key).filter(Boolean)
      : [];
    const bodyImageUrls = Array.isArray(req.body?.image_urls)
      ? req.body.image_urls.map((value) => value?.trim()).filter(Boolean)
      : typeof req.body?.image_urls === 'string' && req.body.image_urls.trim()
        ? [req.body.image_urls.trim()]
        : [];

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const isOwner = Number(post.user_id) === Number(userId);
    if (!isOwner && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const shouldUpdateImages = Array.isArray(req.files) || req.body?.image_urls !== undefined;
    const nextImageUrls = shouldUpdateImages
      ? [...bodyImageUrls, ...uploadedImageKeys]
      : (Array.isArray(post.image_urls)
          ? post.image_urls
          : post.image_url
            ? [post.image_url]
            : []);

    if (nextImageUrls.length > 8) {
      return res.status(400).json({ message: 'Maximum 8 images allowed per post' });
    }

    if (!content && nextImageUrls.length === 0) {
      return res.status(400).json({ message: 'Post content or image is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: 'Post content must be 1000 characters or less' });
    }

    const updateData = { content };
    if (shouldUpdateImages) {
      updateData.image_urls = nextImageUrls;
      updateData.image_url = nextImageUrls.length > 0 ? nextImageUrls[0] : null;
    }

    await post.update(updateData);
    return res.status(200).json(post);
  } catch (err) {
    console.error('updateCommunityPostController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
