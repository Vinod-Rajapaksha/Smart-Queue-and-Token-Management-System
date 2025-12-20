import ApiError from '../../core/apiError.js';
import ServiceRating from '../../database/models/ServiceRating.js';
import Token from '../../database/models/Token.js';
import { TOKEN_STATUS } from '../../core/constants.js';

export const createRating = async ({ tokenId, rating, comment, userId }) => {
  // Token must exist
  const token = await Token.findById(tokenId);
  if (!token) throw new ApiError(404, 'Token not found');

  // Token must be completed
  if (token.status !== TOKEN_STATUS.COMPLETED) {
    throw new ApiError(400, 'Rating allowed only after token is completed');
  }

  // Prevent duplicate ratings
  const existing = await ServiceRating.findOne({ tokenId });
  if (existing) throw new ApiError(409, 'Rating already submitted for this token');

  // Create rating linked to token metadata
  const doc = await ServiceRating.create({
    tokenId: token._id,
    branchId: token.branch._id,
    queueId: token.queue._id,
    counterId: token.counter._id,
    rating: Number(rating),
    comment: comment ? String(comment) : '',
    createdBy: userId || null,
  });

  return doc;
};

export const listRatings = async ({ branchId, queueId, page = 1, limit = 20 }) => {
  const query = {};
  if (branchId) query.branchId = branchId;
  if (queueId) query.queueId = queueId;

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    ServiceRating.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('tokenId', 'tokenNumber status')
      .populate('branchId', 'name code')
      .populate('queueId', 'name')
      .populate('counterId', 'name number'),
    ServiceRating.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getRatingSummary = async ({ branchId, queueId }) => {
  const match = {};
  if (branchId) match.branchId = branchId;
  if (queueId) match.queueId = queueId;

  const result = await ServiceRating.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
        stars1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        stars2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        stars3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        stars4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        stars5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        avgRating: { $round: ['$avgRating', 2] },
        count: 1,
        stars1: 1,
        stars2: 1,
        stars3: 1,
        stars4: 1,
        stars5: 1,
      },
    },
  ]);

  return (
    result[0] || {
      avgRating: 0,
      count: 0,
      stars1: 0,
      stars2: 0,
      stars3: 0,
      stars4: 0,
      stars5: 0,
    }
  );
};
