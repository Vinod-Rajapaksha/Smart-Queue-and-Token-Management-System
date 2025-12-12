import mongoose from 'mongoose';

const { Schema } = mongoose;

const counterSchema = new Schema(
  {
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // short code like "C1", "A-01"
    code: {
      type: String,
      trim: true,
      default: null,
    },

    // list of service names handled at this counter
    services: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// unique code per branch (only when code exists)
counterSchema.index(
  { branch: 1, code: 1 },
  { unique: true, partialFilterExpression: { code: { $type: 'string' } } }
);

export default mongoose.model('Counter', counterSchema);
