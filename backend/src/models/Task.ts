import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
    _id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high';
    assignee: mongoose.Types.ObjectId; // User ID
    project: mongoose.Types.ObjectId; // Project ID
    team: mongoose.Types.ObjectId; // Team ID
    files: string[];
    dependencies: mongoose.Types.ObjectId[]; // Task IDs this task depends on
    tags: string[];
    estimatedHours?: number;
    actualHours?: number;
    dueDate?: Date;
    completedAt?: Date;
    comments: {
        user: mongoose.Types.ObjectId;
        message: string;
        createdAt: Date;
    }[];
    watchers: mongoose.Types.ObjectId[]; // Users watching this task
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'done'],
        default: 'todo',
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
        required: true
    },
    assignee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    files: [{
        type: String,
        trim: true
    }],
    dependencies: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    estimatedHours: {
        type: Number,
        min: 0,
        default: null
    },
    actualHours: {
        type: Number,
        min: 0,
        default: null
    },
    dueDate: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true,
            maxlength: 1000
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    watchers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Set completedAt when status changes to done
taskSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        if (this.status === 'done' && !this.completedAt) {
            this.completedAt = new Date();
        } else if (this.status !== 'done') {
            this.completedAt = undefined;
        }
    }
    next();
});

// Indexes for better query performance
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ team: 1, status: 1 });
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ createdBy: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);