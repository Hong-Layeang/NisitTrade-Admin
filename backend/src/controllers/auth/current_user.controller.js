import models from '../../models/index.js';
import { fn, col } from 'sequelize';
import { presignIfS3Url } from '../../utils/s3-presigned-url.js';

const { User, University, UserFollow, Rating } = models;

export default async function currentUserController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'full_name', 'email', 'profile_image', 'cover_image', 'bio', 'major', 'provider', 'role', 'university_id', 'created_at', 'updated_at'],
      include: [
        {
          model: University,
          attributes: ['id', 'name', 'domain', 'created_at', 'updated_at']
        }
      ]
    });

    if (!user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    const [followerCount, followingCount, ratingSummaryRaw] = await Promise.all([
      UserFollow.count({ where: { following_id: userId } }),
      UserFollow.count({ where: { follower_id: userId } }),
      Rating.findOne({
        where: { seller_id: userId },
        attributes: [
          [fn('COUNT', col('id')), 'rating_count'],
          [fn('AVG', col('rating')), 'avg_rating'],
        ],
        raw: true,
      }),
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

    const userData = user.toJSON();
    const [presignedProfileImage, presignedCoverImage] = await Promise.all([
      presignIfS3Url(userData.profile_image),
      presignIfS3Url(userData.cover_image),
    ]);
    return res.json({
      ...userData,
      profile_image: presignedProfileImage,
      cover_image: presignedCoverImage,
      follower_count: followerCount,
      following_count: followingCount,
      rating_count: ratingCount,
      avg_rating: avgRating,
      is_following: false,
    });
  } catch (error) {
    console.error('currentUser error:', error);
    return res.status(500).json({ msg: 'Internal server error' });
  }
}
