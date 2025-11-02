import mongoose, { Schema } from 'mongoose';
import { IFragment } from '../types';

const FragmentSchema = new Schema<IFragment>(
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
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'fragments',
  }
);

// Compound index: ensure unique fragment names per user
FragmentSchema.index({ userId: 1, name: 1 }, { unique: true });

// Remove __v from JSON responses
FragmentSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Fragment = mongoose.model<IFragment>('Fragment', FragmentSchema);
