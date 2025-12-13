import mongoose from 'mongoose';
import Token from '../../database/models/Token.js';
import ServiceRating from '../../database/models/ServiceRating.js';
import ApiError from '../../core/apiError.js';

const isValidObjectId = (id) =>
  id && mongoose.Types.ObjectId.isValid(id);

const parseDateRange = (from, to) => {
  const start = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const end = to ? new Date(to) : new Date();

  if (start > end) {
    throw new ApiError(400, '`from` date must be before `to` date');
  }

  return { start, end };
};

class AnalyticsService {
  // OVERVIEW
  async overview({ branchId, from, to }) {
    if (branchId && !isValidObjectId(branchId)) {
      throw new ApiError(400, 'Invalid branchId');
    }

    const { start, end } = parseDateRange(from, to);

    const match = {
      createdAt: { $gte: start, $lte: end },
    };

    if (branchId) {
      match.branch = new mongoose.Types.ObjectId(branchId);
    }

    const result = await Token.aggregate([
      { $match: match },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                waiting: { $sum: { $cond: [{ $eq: ['$status', 'WAITING'] }, 1, 0] } },
                serving: { $sum: { $cond: [{ $eq: ['$status', 'SERVING'] }, 1, 0] } },
                completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
                cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
              },
            },
          ],
          timing: [
            {
              $project: {
                waitTime: {
                  $cond: [
                    { $and: ['$servedAt', '$createdAt'] },
                    { $subtract: ['$servedAt', '$createdAt'] },
                    null,
                  ],
                },
                serviceTime: {
                  $cond: [
                    { $and: ['$completedAt', '$servedAt'] },
                    { $subtract: ['$completedAt', '$servedAt'] },
                    null,
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgWaitMs: { $avg: '$waitTime' },
                avgServiceMs: { $avg: '$serviceTime' },
              },
            },
          ],
        },
      },
    ]);

    const totals = result[0]?.totals[0] || {};
    const timing = result[0]?.timing[0] || {};

    return {
      range: { from: start, to: end },
      branchId: branchId || null,
      totals: {
        total: totals.total || 0,
        waiting: totals.waiting || 0,
        serving: totals.serving || 0,
        completed: totals.completed || 0,
        cancelled: totals.cancelled || 0,
      },
      averages: {
        avgWaitMs: Math.round(timing.avgWaitMs || 0),
        avgServiceMs: Math.round(timing.avgServiceMs || 0),
      },
    };
  }

  // VOLUME TREND
  async volume({ branchId, from, to, groupBy = 'day' }) {
    if (branchId && !isValidObjectId(branchId)) {
      throw new ApiError(400, 'Invalid branchId');
    }

    const { start, end } = parseDateRange(from, to);

    const format = groupBy === 'hour' ? '%Y-%m-%d %H:00' : '%Y-%m-%d';

    const match = { createdAt: { $gte: start, $lte: end } };
    if (branchId) match.branch = new mongoose.Types.ObjectId(branchId);

    const data = await Token.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            bucket: { $dateToString: { format, date: '$createdAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.bucket',
          total: { $sum: '$count' },
          statusBreakdown: {
            $push: { status: '$_id.status', count: '$count' },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, bucket: '$_id', total: 1, statusBreakdown: 1 } },
    ]);

    return { range: { from: start, to: end }, branchId: branchId || null, groupBy, data };
  }

  // RATINGS
  async ratings({ branchId, from, to }) {
    if (branchId && !isValidObjectId(branchId)) {
      throw new ApiError(400, 'Invalid branchId');
    }

    const { start, end } = parseDateRange(from, to);

    const match = { createdAt: { $gte: start, $lte: end } };
    if (branchId) match.branch = new mongoose.Types.ObjectId(branchId);

    const ratings = await ServiceRating.aggregate([
      { $match: match },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const total = ratings.reduce((a, b) => a + b.count, 0);
    const avg =
      total === 0
        ? 0
        : ratings.reduce((a, b) => a + b._id * b.count, 0) / total;

    return {
      range: { from: start, to: end },
      branchId: branchId || null,
      totalRatings: total,
      averageRating: Number(avg.toFixed(2)),
      breakdown: ratings.map((r) => ({
        rating: r._id,
        count: r.count,
      })),
    };
  }
}

export default new AnalyticsService();
