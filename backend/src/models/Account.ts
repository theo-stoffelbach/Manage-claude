import mongoose, { Schema } from 'mongoose';
import { IAccount } from '../types';

const AccountSchema = new Schema<IAccount>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['personal', 'work', 'custom'],
      default: 'personal',
    },
    apiKey: {
      type: String,
      required: true,
      // API key is encrypted before storage
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'accounts',
  }
);

// Indexes
AccountSchema.index({ userId: 1 });
AccountSchema.index({ userId: 1, isActive: 1 });

// Ensure only one active account per user
AccountSchema.pre('save', async function (next) {
  if (this.isActive && this.isModified('isActive')) {
    // Deactivate all other accounts for this user
    await mongoose.model('Account').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

// Never expose the encrypted API key in JSON responses
AccountSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.apiKey;
    delete ret.__v;
    return ret;
  },
});

export const Account = mongoose.model<IAccount>('Account', AccountSchema);
