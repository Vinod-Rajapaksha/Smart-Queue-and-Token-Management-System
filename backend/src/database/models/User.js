import mongoose from 'mongoose';

const { Schema } = mongoose;

const USER_ROLES = ['ADMIN', 'STAFF', 'CUSTOMER'];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    telephone: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'STAFF',
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('User', userSchema);
export { USER_ROLES };