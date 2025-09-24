import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Team, ITeam } from '../models/Team';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middlewares/auth';

export class AuthController {
    // Register new user
    static async register(req: Request, res: Response) {
        try {
            const { email, password, name } = req.body;

            // Validate input
            if (!email || !password || !name) {
                return res.status(400).json({
                    message: 'Email, password, and name are required',
                    code: 'MISSING_FIELDS'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message: 'Password must be at least 6 characters long',
                    code: 'PASSWORD_TOO_SHORT'
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({
                    message: 'User already exists with this email',
                    code: 'USER_EXISTS'
                });
            }

            // Create new user
            const user = new User({
                email: email.toLowerCase(),
                password,
                name,
                status: 'online'
            });

            await user.save();

            // Generate token
            const token = generateToken(user);

            res.status(201).json({
                message: 'User created successfully',
                user: user.toJSON(),
                token,
                expiresIn: '7d'
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                message: 'Internal server error during registration',
                code: 'REGISTRATION_ERROR'
            });
        }
    }

    // Login user
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: 'Email and password are required',
                    code: 'MISSING_CREDENTIALS'
                });
            }

            // Find user by email
            const user = await User.findOne({ email: email.toLowerCase() })
                .populate('teams')
                .populate('currentTeam');

            if (!user) {
                return res.status(401).json({
                    message: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Check password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Update user status and last seen
            user.status = 'online';
            user.lastSeen = new Date();
            await user.save();

            // Generate token
            const token = generateToken(user);

            res.json({
                message: 'Login successful',
                user: user.toJSON(),
                token,
                expiresIn: '7d'
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                message: 'Internal server error during login',
                code: 'LOGIN_ERROR'
            });
        }
    }

    // Logout user
    static async logout(req: AuthRequest, res: Response) {
        try {
            if (req.user) {
                req.user.status = 'offline';
                req.user.lastSeen = new Date();
                await req.user.save();
            }

            res.json({
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                message: 'Internal server error during logout',
                code: 'LOGOUT_ERROR'
            });
        }
    }

    // Get current user profile
    static async getProfile(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'User not authenticated',
                    code: 'NOT_AUTHENTICATED'
                });
            }

            const user = await User.findById(req.user._id)
                .populate('teams', 'name avatar inviteCode')
                .populate('currentTeam', 'name avatar');

            res.json({
                user: user?.toJSON()
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                message: 'Internal server error getting profile',
                code: 'PROFILE_ERROR'
            });
        }
    }

    // Update user profile
    static async updateProfile(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'User not authenticated',
                    code: 'NOT_AUTHENTICATED'
                });
            }

            const { name, avatar, status } = req.body;
            const updateData: Partial<IUser> = {};

            if (name) updateData.name = name;
            if (avatar) updateData.avatar = avatar;
            if (status && ['online', 'offline', 'busy', 'away'].includes(status)) {
                updateData.status = status;
            }

            const user = await User.findByIdAndUpdate(
                req.user._id,
                updateData,
                { new: true }
            ).populate('teams currentTeam');

            res.json({
                message: 'Profile updated successfully',
                user: user?.toJSON()
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                message: 'Internal server error updating profile',
                code: 'UPDATE_PROFILE_ERROR'
            });
        }
    }

    // Switch current team
    static async switchTeam(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'User not authenticated',
                    code: 'NOT_AUTHENTICATED'
                });
            }

            const { teamId } = req.body;

            if (!teamId) {
                return res.status(400).json({
                    message: 'Team ID is required',
                    code: 'MISSING_TEAM_ID'
                });
            }

            // Check if user is member of this team
            const team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({
                    message: 'Team not found',
                    code: 'TEAM_NOT_FOUND'
                });
            }

            const isMember = team.members.some(
                member => member.user.toString() === req.user!._id && member.status === 'active'
            );

            if (!isMember) {
                return res.status(403).json({
                    message: 'You are not a member of this team',
                    code: 'NOT_TEAM_MEMBER'
                });
            }

            // Update current team
            req.user.currentTeam = team._id;
            await req.user.save();

            // Generate new token with updated team
            const token = generateToken(req.user);

            res.json({
                message: 'Team switched successfully',
                currentTeam: team,
                token,
                expiresIn: '7d'
            });
        } catch (error) {
            console.error('Switch team error:', error);
            res.status(500).json({
                message: 'Internal server error switching team',
                code: 'SWITCH_TEAM_ERROR'
            });
        }
    }
}