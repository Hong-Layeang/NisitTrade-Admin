import models from '../../models/index.js';
import { presignIfS3Url } from '../../utils/s3-presigned-url.js';

const { User } = models;

export default async function updateCoverController(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (user_id && String(user_id) !== String(id)) {
      return res.status(403).json({
        message: 'You do not have permission to update this user',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const uploadedUrl = req.file?.location || req.file?.path;
    const bodyUrl = req.body?.cover_image;
    const coverImage = uploadedUrl || bodyUrl;

    if (!coverImage) {
      return res.status(400).json({ message: 'Cover image is required' });
    }

    await user.update({ cover_image: coverImage });

    const presignedCoverImage = await presignIfS3Url(user.cover_image);

    res.json({
      id: user.id,
      cover_image: presignedCoverImage,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error('Error updating cover image:', error);
    res.status(500).json({
      message: 'Failed to update cover image',
      error: error.message,
    });
  }
}
