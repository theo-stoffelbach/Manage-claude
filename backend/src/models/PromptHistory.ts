import mongoose, { Schema } from 'mongoose';
import { IPromptHistory } from '../types';

const PromptHistorySchema = new Schema<IPromptHistory>(
  {
    promptId: {
      type: String,
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'prompt_history',
  }
);

// Index for retrieving history by promptId
PromptHistorySchema.index({ promptId: 1, version: -1 });

// Remove __v from JSON responses
PromptHistorySchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const PromptHistory = mongoose.model<IPromptHistory>(
  'PromptHistory',
  PromptHistorySchema
);
