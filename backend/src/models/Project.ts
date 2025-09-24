import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
    _id: string;
    name: string;
    description?: string;
    repositoryUrl?: string;
    team: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId;
    collaborators: {
        user: mongoose.Types.ObjectId;
        role: 'owner' | 'admin' | 'editor' | 'viewer';
        permissions: string[];
        addedAt: Date;
    }[];
    settings: {
        isPrivate: boolean;
        allowExternalCollaborators: boolean;
        autoConflictDetection: boolean;
        requireCodeReview: boolean;
        branchProtection: boolean;
    };
    stats: {
        totalTasks: number;
        completedTasks: number;
        totalFiles: number;
        activeCollaborators: number;
        lastActivity: Date;
    };
    tags: string[];
    status: 'active' | 'archived' | 'paused';
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500,
        default: ''
    },
    repositoryUrl: {
        type: String,
        trim: true,
        default: null
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'editor', 'viewer'],
            default: 'editor'
        },
        permissions: [{
            type: String,
            enum: ['read', 'write', 'delete', 'manage_users', 'manage_settings']
        }],
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        isPrivate: {
            type: Boolean,
            default: true
        },
        allowExternalCollaborators: {
            type: Boolean,
            default: false
        },
        autoConflictDetection: {
            type: Boolean,
            default: true
        },
        requireCodeReview: {
            type: Boolean,
            default: false
        },
        branchProtection: {
            type: Boolean,
            default: false
        }
    },
    stats: {
        totalTasks: {
            type: Number,
            default: 0
        },
        completedTasks: {
            type: Number,
            default: 0
        },
        totalFiles: {
            type: Number,
            default: 0
        },
        activeCollaborators: {
            type: Number,
            default: 0
        },
        lastActivity: {
            type: Date,
            default: Date.now
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    status: {
        type: String,
        enum: ['active', 'archived', 'paused'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Update stats on save
projectSchema.pre('save', function(next) {
    this.stats.activeCollaborators = this.collaborators.length;
    this.stats.lastActivity = new Date();
    next();
});

// Index for better query performance
projectSchema.index({ team: 1, status: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ 'collaborators.user': 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);