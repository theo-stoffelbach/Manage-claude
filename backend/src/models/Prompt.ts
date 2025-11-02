import mongoose, { Schema } from 'mongoose';
import { IPrompt } from '../types';

const PromptSchema = new Schema<IPrompt>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    accountId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
      lowercase: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    variables: {
      type: [String],
      default: [],
    },
    version: {
      type: Number,
      default: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'prompts',
  }
);

// Indexes for efficient queries
PromptSchema.index({ userId: 1, createdAt: -1 });
PromptSchema.index({ userId: 1, category: 1 });
PromptSchema.index({ userId: 1, tags: 1 });
PromptSchema.index({ title: 'text', content: 'text' });

// Remove __v from JSON responses
PromptSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Prompt = mongoose.model<IPrompt>('Prompt', PromptSchema);
