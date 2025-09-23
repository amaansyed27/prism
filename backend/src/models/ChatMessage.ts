import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  message: string;
  type: 'chat' | 'checklist' | 'system';
  sender: string;
  teamId: string;
  timestamp: Date;
  metadata?: any;
}

const ChatMessageSchema: Schema = new Schema({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['chat', 'checklist', 'system'],
    default: 'chat'
  },
  sender: {
    type: String,
    required: true
  },
  teamId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: null
  }
});

// Index for efficient queries
ChatMessageSchema.index({ teamId: 1, timestamp: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);