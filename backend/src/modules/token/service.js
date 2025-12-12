import Token from '../../database/models/Token.js';
import Queue from '../../database/models/Queue.js';
import ApiError from '../../core/apiError.js';

class TokenService {
  async createToken(userId, branchId, queueId) {
    // Check existing active token
    const existingToken = await Token.findOne({
      user: userId,
      branch: branchId,
      status: { $in: ['CREATED', 'WAITING', 'SERVING'] },
    });

    if (existingToken) {
      throw new ApiError(400, 'User already has an active token');
    }

    // Get last token number for branch
    const lastToken = await Token.findOne({ branch: branchId })
      .sort({ tokenNumber: -1 })
      .select('tokenNumber');

    const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const token = await Token.create({
      tokenNumber: nextTokenNumber,
      user: userId,
      branch: branchId,
      queue: queueId,
      status: 'WAITING',
    });

    // Push token into queue
    await Queue.findByIdAndUpdate(queueId, {
      $push: { tokens: token._id },
    });

    return token;
  }

  async getMyTokens(userId) {
    return Token.find({ user: userId })
      .populate('branch queue')
      .sort({ createdAt: -1 });
  }

  async updateTokenStatus(tokenId, status) {
    const token = await Token.findById(tokenId);

    if (!token) {
      throw new ApiError(404, 'Token not found');
    }

    token.status = status;

    if (status === 'SERVING') token.servedAt = new Date();
    if (status === 'COMPLETED') token.completedAt = new Date();

    await token.save();
    return token;
  }
}

export default new TokenService();
