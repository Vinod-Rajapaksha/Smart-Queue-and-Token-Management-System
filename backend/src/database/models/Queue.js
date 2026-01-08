import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },

    counter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counter',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
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

queueSchema.index(
  { branch: 1, counter: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'OPEN' },
    name: 'unique_open_queue_per_counter',
  }
);

const Queue = mongoose.model('Queue', queueSchema);
export default Queue;
