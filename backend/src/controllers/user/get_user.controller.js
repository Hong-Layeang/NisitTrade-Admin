import models from '../../models/index.js';
import { presignIfS3Url } from '../../utils/s3-presigned-url.js';

const { User, University, UserFollow } = models;

export default async function getUserController(req, res) {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const isOwner = String(requesterId) === String(id);
    const isAdmin = requesterRole === 'admin';

    const user = await User.findByPk(id, {
      attributes: ['id', 'full_name', 'email', 'profile_image', 'cover_image', 'bio', 'major', 'provider', 'role', 'university_id', 'created_at', 'updated_at'],
      include: [
        {
          model: University,
          attributes: ['id', 'name', 'domain', 'created_at', 'updated_at']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Count followers and following
    const [followerCount, followingCount, isFollowingTarget] = await Promise.all([
      UserFollow.count({ where: { following_id: id } }),
      UserFollow.count({ where: { follower_id: id } }),
      requesterId && !isOwner
        ? UserFollow.count({ where: { follower_id: requesterId, following_id: id } })
        : Promise.resolve(0),
    ]);

    const [presignedProfileImage, presignedCoverImage] = await Promise.all([
      presignIfS3Url(user.profile_image),
      presignIfS3Url(user.cover_image),
    ]);

    const basePublicProfile = {
      id: user.id,
      full_name: user.full_name,
      profile_image: presignedProfileImage,
      cover_image: presignedCoverImage,
      bio: user.bio,
      major: user.major,
      role: user.role,
      university_id: user.university_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      University: user.University,
      follower_count: followerCount,
      following_count: followingCount,
      is_following: Boolean(isFollowingTarget),
    };

    // Return full profile to owner/admin; return only public fields to others
    if (isOwner || isAdmin) {
      return res.json({
        ...basePublicProfile,
        email: user.email,
        provider: user.provider,
        is_following: false,
      });
    }

    res.json(basePublicProfile);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      message: 'Failed to fetch user',
      error: error.message
    });
  }
}
