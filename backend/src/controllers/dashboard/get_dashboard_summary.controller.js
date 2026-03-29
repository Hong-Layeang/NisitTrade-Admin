import { Op } from 'sequelize';
import models from '../../models/index.js';

const { User, Product, ActivityLog } = models;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function monthLabel(date) {
  return date.toLocaleString('en-US', { month: 'short' });
}

export default async function getDashboardSummaryController(req, res) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      usersCount,
      totalUserProduct,
      remainingListing,
      soldProducts,
      productSoldAdmin,
      soldProductsAdmin,
      recentActivities,
    ] = await Promise.all([
      User.count({ where: { role: 'user' } }),
      Product.count({
        include: [{ model: User, attributes: [], where: { role: 'user' }, required: true }],
      }),
      Product.count({
        where: {
          status: { [Op.notIn]: ['sold', 'hidden'] },
        },
      }),
      Product.findAll({
        where: { status: 'sold' },
        attributes: ['price', 'created_at'],
        raw: true,
      }),
      Product.count({
        where: { status: 'sold' },
        include: [{ model: User, attributes: [], where: { role: 'admin' }, required: true }],
      }),
      Product.findAll({
        where: { status: 'sold' },
        attributes: ['price', 'created_at'],
        include: [{ model: User, attributes: [], where: { role: 'admin' }, required: true }],
        raw: true,
      }),
      ActivityLog.findAll({
        attributes: ['action_type', 'message', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 30,
        raw: true,
      }),
    ]);

    const revenue = soldProducts.reduce((sum, row) => sum + toNumber(row.price), 0);

    const todayIncome = soldProducts
      .filter((row) => new Date(row.created_at) >= startOfToday)
      .reduce((sum, row) => sum + toNumber(row.price), 0);

    const weekIncome = soldProducts
      .filter((row) => new Date(row.created_at) >= weekAgo)
      .reduce((sum, row) => sum + toNumber(row.price), 0);

    const monthIncome = soldProducts
      .filter((row) => {
        const createdAt = new Date(row.created_at);
        return createdAt >= startOfMonth;
      })
      .reduce((sum, row) => sum + toNumber(row.price), 0);

    const previousMonthIncome = soldProducts
      .filter((row) => {
        const createdAt = new Date(row.created_at);
        return createdAt >= startOfPrevMonth && createdAt < startOfMonth;
      })
      .reduce((sum, row) => sum + toNumber(row.price), 0);

    const incomeGrowth = previousMonthIncome > 0
      ? Math.round(((monthIncome - previousMonthIncome) / previousMonthIncome) * 100)
      : monthIncome > 0
        ? 100
        : 0;

    const monthBuckets = Array.from({ length: 6 }).map((_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: monthLabel(d),
        value: 0,
      };
    });

    soldProductsAdmin.forEach((row) => {
      const createdAt = new Date(row.created_at);
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const bucket = monthBuckets.find((entry) => entry.key === key);
      if (bucket) {
        bucket.value += toNumber(row.price);
      }
    });

    const activities = recentActivities
      .map((row) => ({
        text: row.message,
        type: row.action_type,
        created_at: row.created_at,
      }))
      .slice(0, 12);

    return res.json({
      stats: {
        users: usersCount,
        revenue,
        totalUserProduct,
        remainingListing,
        productSold: productSoldAdmin,
      },
      income: {
        todayIncome,
        weekIncome,
        monthIncome,
        incomeGrowth,
      },
      salesOverview: monthBuckets.map(({ month, value }) => ({ month, value })),
      activities,
    });
  } catch (error) {
    console.error('Error building dashboard summary:', error);
    return res.status(500).json({
      message: 'Failed to load dashboard summary',
      error: error.message,
    });
  }
}
