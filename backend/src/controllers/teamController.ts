import { Request, Response } from 'express';
import { Team, ITeam } from '../models/Team';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

// Legacy team member functions for backward compatibility
import { TeamMember } from '../models/TeamMember';

export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const teamId = req.headers['x-team-id'] as string || 'default-team';
    const members = await TeamMember.find({ teamId }).sort({ lastSeen: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

export const updateMyStatus = async (req: Request, res: Response) => {
  try {
    const teamId = req.headers['x-team-id'] as string || 'default-team';
    const { status, currentTask, email, name } = req.body;
    
    // For demo purposes, we'll use email or create a default user
    const userEmail = email || 'developer@prism.dev';
    const userName = name || 'Developer';
    
    const member = await TeamMember.findOneAndUpdate(
      { email: userEmail, teamId },
      {
        name: userName,
        email: userEmail,
        status,
        currentTask,
        teamId,
        lastSeen: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const teamId = req.headers['x-team-id'] as string || 'default-team';
    const memberData = {
      ...req.body,
      teamId
    };
    
    const member = new TeamMember(memberData);
    await member.save();
    
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add team member' });
  }
};

// New comprehensive team management controller
export class TeamController {
    // Create new team
    static async createTeam(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'User not authenticated',
                    code: 'NOT_AUTHENTICATED'
                });
            }

            const { name, description, settings } = req.body;

            if (!name) {
                return res.status(400).json({
                    message: 'Team name is required',
                    code: 'MISSING_TEAM_NAME'
                });
            }

            // Create new team
            const team = new Team({
                name,
                description: description || '',
                owner: req.user._id,
                members: [{
                    user: new mongoose.Types.ObjectId(req.user._id),
                    role: 'owner',
                    status: 'active',
                    joinedAt: new Date()
                }],
                settings: {
                    isPublic: settings?.isPublic || false,
                    maxMembers: settings?.maxMembers || 50,
                    allowInvites: settings?.allowInvites !== false,
                    requireApproval: settings?.requireApproval || false
                }
            });

            await team.save();

            // Add team to user's teams array
            req.user.teams.push(team._id);
            if (!req.user.currentTeam) {
                req.user.currentTeam = team._id;
            }
            await req.user.save();

            // Populate team data for response
            await team.populate('owner', 'name email avatar');
            await team.populate('members.user', 'name email avatar status');

            res.status(201).json({
                message: 'Team created successfully',
                team,
                inviteCode: team.inviteCode
            });
        } catch (error) {
            console.error('Create team error:', error);
            res.status(500).json({
                message: 'Internal server error creating team',
                code: 'CREATE_TEAM_ERROR'
            });
        }
    }

    // Join team by invite code
    static async joinTeamByInvite(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'User not authenticated',
                    code: 'NOT_AUTHENTICATED'
                });
            }

            const { inviteCode } = req.body;

            if (!inviteCode) {
                return res.status(400).json({
                    message: 'Invite code is required',
                    code: 'MISSING_INVITE_CODE'
                });
            }

            // Find team by invite code
            const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });
            
            if (!team) {
                return res.status(404).json({
                    message: 'Invalid invite code',
                    code: 'INVALID_INVITE_CODE'
                });
            }

            // Check if user is already a member
            const existingMember = team.members.find(
                member => member.user.toString() === req.user!._id
            );

            if (existingMember) {
                if (existingMember.status === 'active') {
                    return res.status(409).json({
                        message: 'You are already a member of this team',
                        code: 'ALREADY_MEMBER'
                    });
                } else {
                    // Reactivate member
                    existingMember.status = 'active';
                    existingMember.joinedAt = new Date();
                }
            } else {
                // Check team capacity
                if (team.members.length >= team.settings.maxMembers) {
                    return res.status(403).json({
                        message: 'Team has reached maximum member capacity',
                        code: 'TEAM_FULL'
                    });
                }

                // Add new member
                const newMemberStatus = team.settings.requireApproval ? 'pending' : 'active';
                
                team.members.push({
                    user: new mongoose.Types.ObjectId(req.user._id),
                    role: 'member',
                    status: newMemberStatus,
                    joinedAt: new Date()
                });
            }

            await team.save();

            // Add team to user's teams if not already present
            if (!req.user.teams.includes(team._id)) {
                req.user.teams.push(team._id);
            }

            // Set as current team if user doesn't have one
            if (!req.user.currentTeam) {
                req.user.currentTeam = team._id;
            }

            await req.user.save();

            // Populate team data
            await team.populate('owner', 'name email avatar');
            await team.populate('members.user', 'name email avatar status');

            res.json({
                message: 'Successfully joined team',
                team,
                requiresApproval: team.settings.requireApproval
            });
        } catch (error) {
            console.error('Join team error:', error);
            res.status(500).json({
                message: 'Internal server error joining team',
                code: 'JOIN_TEAM_ERROR'
            });
        }
    }

    // Get user's teams
    static async getUserTeams(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'User not authenticated',
                    code: 'NOT_AUTHENTICATED'
                });
            }

            const teams = await Team.find({
                _id: { $in: req.user.teams },
                'members': {
                    $elemMatch: {
                        user: req.user._id,
                        status: 'active'
                    }
                }
            })
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar status')
            .populate('projects', 'name description status')
            .sort({ updatedAt: -1 });

            res.json({
                teams,
                currentTeam: req.user.currentTeam?.toString()
            });
        } catch (error) {
            console.error('Get user teams error:', error);
            res.status(500).json({
                message: 'Internal server error getting teams',
                code: 'GET_TEAMS_ERROR'
            });
        }
    }

    // Get team details
    static async getTeamById(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'User not authenticated',
                    code: 'NOT_AUTHENTICATED'
                });
            }

            const { teamId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(teamId)) {
                return res.status(400).json({
                    message: 'Invalid team ID format',
                    code: 'INVALID_TEAM_ID'
                });
            }

            const team = await Team.findById(teamId)
                .populate('owner', 'name email avatar')
                .populate('members.user', 'name email avatar status lastSeen')
                .populate('projects', 'name description status stats');

            if (!team) {
                return res.status(404).json({
                    message: 'Team not found',
                    code: 'TEAM_NOT_FOUND'
                });
            }

            // Check if user is a member
            const isMember = team.members.some(
                member => member.user._id.toString() === req.user!._id && member.status === 'active'
            );

            if (!isMember) {
                return res.status(403).json({
                    message: 'You are not a member of this team',
                    code: 'NOT_TEAM_MEMBER'
                });
            }

            res.json({ team });
        } catch (error) {
            console.error('Get team details error:', error);
            res.status(500).json({
                message: 'Internal server error getting team details',
                code: 'GET_TEAM_DETAILS_ERROR'
            });
        }
    }
}