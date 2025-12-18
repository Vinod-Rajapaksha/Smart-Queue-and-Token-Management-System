import Token from '../../database/models/Token.js';
import Queue from '../../database/models/Queue.js';
import ApiError from '../../core/apiError.js';
import { TOKEN_STATUS } from '../../core/constants.js';

class TokenService {
  async createToken(userId, branchId, queueId) {
    // Check existing active token
    const existingToken = await Token.findOne({
      user: userId,
      branch: branchId,
      status: { $in: [TOKEN_STATUS.CREATED, TOKEN_STATUS.WAITING, TOKEN_STATUS.CALLING, TOKEN_STATUS.SERVING, TOKEN_STATUS.SKIPPED] },
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
      status: TOKEN_STATUS.WAITING,
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
    
    if (status === TOKEN_STATUS.SERVING) token.servedAt = new Date();
    if (status === TOKEN_STATUS.COMPLETED) token.completedAt = new Date();
    if (status === TOKEN_STATUS.CANCELLED) token.cancelledAt = new Date();
    if (status === TOKEN_STATUS.SKIPPED) token.skippedAt = new Date();
    if (status === TOKEN_STATUS.CALLING) token.calledAt = new Date();

    await token.save();
    return token;
  }
}

export default new TokenService();
