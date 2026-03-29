import models from '../../models/index.js';
import { fn, col } from 'sequelize';
import { presignIfS3Url } from '../../utils/s3-presigned-url.js';
import { getPresenceForUserIds } from '../../utils/websockets/presence.socket.js';

const { User, University, UserFollow, Rating } = models;

export default async function getUserController(req, res) {
  try {
    const { id } = req.params;
    const targetUserId = Number(id);
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const isOwner = requesterId === targetUserId;
    const isAdmin = requesterRole === 'admin';

    const user = await User.findByPk(targetUserId, {
      attributes: ['id', 'full_name', 'email', 'profile_image', 'cover_image', 'bio', 'major', 'provider', 'role', 'university_id', 'created_at', 'updated_at', 'last_seen_at'],
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
    const [followerCount, followingCount, isFollowingTarget, ratingSummaryRaw] = await Promise.all([
      UserFollow.count({ where: { following_id: targetUserId } }),
      UserFollow.count({ where: { follower_id: targetUserId } }),
      requesterId && !isOwner
        ? UserFollow.count({ where: { follower_id: requesterId, following_id: targetUserId } })
        : Promise.resolve(0),
      Rating
        ? Rating.findOne({
            where: { seller_id: targetUserId },
            attributes: [
              [fn('COUNT', col('id')), 'rating_count'],
              [fn('AVG', col('rating')), 'avg_rating'],
            ],
            raw: true,
          })
        : Promise.resolve(null),
    ]);

    const ratingCount = Number.parseInt(
      String(ratingSummaryRaw?.rating_count ?? 0),
      10,
    ) || 0;
    const avgRatingRaw = Number.parseFloat(
      String(ratingSummaryRaw?.avg_rating ?? 0),
    ) || 0;
    const avgRating = ratingCount > 0
      ? Math.round(avgRatingRaw * 10) / 10
      : 0;

    const [presignedProfileImage, presignedCoverImage, presenceByUserId] = await Promise.all([
      presignIfS3Url(user.profile_image),
      presignIfS3Url(user.cover_image),
      getPresenceForUserIds([user.id]),
    ]);

    const presence = presenceByUserId.get(Number(user.id)) ?? {
      is_online: false,
      last_seen_at: user.last_seen_at ?? null,
    };

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
      rating_count: ratingCount,
      avg_rating: avgRating,
      is_following: Boolean(isFollowingTarget),
      email_domain: user.email ? (user.email.split('@')[1] ?? null) : null,
      is_online: presence.is_online,
      last_seen_at: presence.last_seen_at,
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
