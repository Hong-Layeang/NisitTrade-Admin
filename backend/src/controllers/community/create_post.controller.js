import models from '../../models/index.js';
import serializeCommunityPost from './serialize_post.js';

const { CommunityPost, CommunityPostLike, User, University } = models;

export default async function createCommunityPostController(req, res) {
  try {
    const { content, image_url, image_urls } = req.body;
    const userId = req.user?.id;
    const uploadedImageKeys = Array.isArray(req.files)
      ? req.files.map((file) => file.key).filter(Boolean)
      : [];
    const bodyImageUrls = Array.isArray(image_urls)
      ? image_urls.map((value) => value?.trim()).filter(Boolean)
      : typeof image_urls === 'string' && image_urls.trim()
        ? [image_urls.trim()]
        : [];

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const contentText = content?.trim() || '';
    if (!contentText && uploadedImageKeys.length === 0) {
      return res.status(400).json({ message: 'Post content or image is required' });
    }

    if (contentText.length > 1000) {
      return res.status(400).json({ message: 'Post content must be 1000 characters or less' });
    }

    if (uploadedImageKeys.length > 8) {
      return res.status(400).json({ message: 'Maximum 8 images allowed per post' });
    }

    const fallbackImageUrls = bodyImageUrls.length > 0
      ? bodyImageUrls
      : image_url?.trim()
        ? [image_url.trim()]
        : [];
    const orderedImageUrls = uploadedImageKeys.length > 0
      ? uploadedImageKeys
      : fallbackImageUrls;

    const post = await CommunityPost.create({
      content: contentText,
      image_url: orderedImageUrls.length > 0 ? orderedImageUrls[0] : null,
      image_urls: orderedImageUrls,
      user_id: userId,
      likes_count: 0,
      comments_count: 0,
    });

    const createdPost = await CommunityPost.findByPk(post.id, {
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
          where: { user_id: userId },
          required: false,
          attributes: ['id', 'user_id', 'community_post_id'],
        },
      ],
    });
    const serialized = await serializeCommunityPost(createdPost);

    return res.status(201).json(serialized);
  } catch (err) {
    console.error('createCommunityPostController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
