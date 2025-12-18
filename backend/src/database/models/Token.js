import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    counter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counter',
    },
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: true,
    },
    status: {
      type: String,
      enum: ['CREATED', 'WAITING', 'CALLING', 'SERVING', 'COMPLETED', 'CANCELLED', 'SKIPPED'],
      default: 'CREATED',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    skippedAt: Date,
    skippedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    servedAt: Date,
    servedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    calledAt: Date,
    calledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Token', tokenSchema);
