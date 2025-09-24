import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITeam extends Document {
    _id: string;
    name: string;
    description?: string;
    avatar?: string;
    inviteCode: string;
    owner: mongoose.Types.ObjectId;
    members: {
        user: mongoose.Types.ObjectId;
        role: 'owner' | 'admin' | 'member';
        joinedAt: Date;
        status: 'active' | 'inactive' | 'pending';
    }[];
    projects: mongoose.Types.ObjectId[];
    settings: {
        isPublic: boolean;
        maxMembers: number;
        allowInvites: boolean;
        requireApproval: boolean;
    };
    stats: {
        totalTasks: number;
        completedTasks: number;
        activeMembersCount: number;
    };
    createdAt: Date;
    updatedAt: Date;
    generateNewInviteCode(): string;
}

const teamSchema = new Schema<ITeam>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 200,
        default: ''
    },
    avatar: {
        type: String,
        default: null
    },
    inviteCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'pending'],
            default: 'active'
        }
    }],
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    settings: {
        isPublic: {
            type: Boolean,
            default: false
        },
        maxMembers: {
            type: Number,
            default: 50,
            min: 1,
            max: 200
        },
        allowInvites: {
            type: Boolean,
            default: true
        },
        requireApproval: {
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
        activeMembersCount: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Generate invite code before saving
teamSchema.pre('save', function(next) {
    if (this.isNew && !this.inviteCode) {
        this.inviteCode = this.generateNewInviteCode();
    }
    
    // Update stats
    this.stats.activeMembersCount = this.members.filter((m: any) => m.status === 'active').length;
    next();
});

// Method to generate new invite code
teamSchema.methods.generateNewInviteCode = function(): string {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.inviteCode = `PRISM-${code}`;
    return this.inviteCode;
};

export const Team = mongoose.model<ITeam>('Team', teamSchema);