import { Op } from 'sequelize';
import models from '../../models/index.js';

const { Rating, User } = models;

export const getSellerRatingsController = async (req, res) => {
  try {
    const sellerId = Number(req.params.id);
    if (!sellerId || isNaN(sellerId)) {
      return res.status(400).json({ message: 'Invalid seller id' });
    }

    const ratings = await Rating.findAll({
      where: { seller_id: sellerId },
      include: [
        {
          model: User,
          as: 'Buyer',
          attributes: ['id', 'full_name', 'profile_image'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const total = ratings.length;
    const avgRating = total
      ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
      : 0;

    return res.status(200).json({ ratings, avg_rating: avgRating, total });
  } catch (error) {
    console.error('getSellerRatingsController error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
