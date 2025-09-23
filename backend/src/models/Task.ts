import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee: string;
  files: string[];
  priority: 'low' | 'medium' | 'high';
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },
  assignee: {
    type: String,
    required: true
  },
  files: [{
    type: String
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  teamId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
TaskSchema.index({ teamId: 1, status: 1 });
TaskSchema.index({ assignee: 1, status: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);