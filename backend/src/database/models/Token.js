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
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: true,
    },
    status: {
      type: String,
      enum: ['CREATED', 'WAITING', 'SERVING', 'COMPLETED', 'CANCELLED'],
      default: 'CREATED',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    servedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Token', tokenSchema);
