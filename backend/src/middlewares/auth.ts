import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
    userId?: string;
    currentTeam?: string;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                message: 'Access token required',
                code: 'NO_TOKEN'
            });
        }

        const decoded: JwtPayload = verifyToken(token);
        
        // Fetch the current user data
        const user = await User.findById(decoded.userId).populate('teams currentTeam');
        
        if (!user) {
            return res.status(401).json({
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Update last seen
        user.lastSeen = new Date();
        await user.save();

        req.user = user;
        req.userId = user._id;
        req.currentTeam = user.currentTeam?.toString();
        
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token',
            code: 'INVALID_TOKEN',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    // Try to authenticate, but don't fail if token is invalid
    authenticateToken(req, res, (err) => {
        // Continue regardless of auth success/failure
        next();
    });
}

export function requireTeam(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.currentTeam) {
        return res.status(400).json({
            message: 'No team selected. Please select a team first.',
            code: 'NO_TEAM_SELECTED'
        });
    }
    next();
}