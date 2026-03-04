import models from '../../models/index.js';
import { presignIfS3Url } from '../../utils/s3-presigned-url.js';

const { User } = models;

export default async function updateAvatarController(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (user_id && String(user_id) !== String(id)) {
      return res.status(403).json({
        message: 'You do not have permission to update this user'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const uploadedUrl = req.file?.location || req.file?.path;
    const bodyUrl = req.body?.profile_image;
    const profileImage = uploadedUrl || bodyUrl;

    if (!profileImage) {
      return res.status(400).json({
        message: 'Profile image is required'
      });
    }

    await user.update({ profile_image: profileImage });

    const presignedProfileImage = await presignIfS3Url(user.profile_image);

    res.json({
      id: user.id,
      profile_image: presignedProfileImage,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({
      message: 'Failed to update avatar',
      error: error.message
    });
  }
}
