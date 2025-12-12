import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED'],
      default: 'ACTIVE',
      index: true,
    },

    // Current token being called
    currentToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      default: null,
    },

    // Queue lifecycle tracking
    openedAt: {
      type: Date,
      default: Date.now,
    },

    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    closedAt: {
      type: Date,
      default: null,
    },

    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Monitoring
    lastCalledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active queues per branch per day (logical rule)
queueSchema.index(
  { branch: 1, status: 1, createdAt: 1 },
  { name: 'branch_status_createdAt_idx' }
);

const Queue = mongoose.model('Queue', queueSchema);
export default Queue;
