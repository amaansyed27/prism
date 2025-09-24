import * as jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'prism-dev-secret-key-change-in-production';
// Use numeric seconds for expiresIn to match typings; fallback to 7 days.
const JWT_EXPIRES_IN: number = (() => {
    const raw = process.env.JWT_EXPIRES_IN;
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60 * 60 * 24 * 7;
})();

export interface JwtPayload {
    userId: string;
    email: string;
    currentTeam?: string;
}

export function generateToken(user: IUser): string {
    const payload: JwtPayload = {
        userId: user._id.toString(),
        email: user.email,
        currentTeam: user.currentTeam?.toString()
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'prism-api',
        subject: user._id.toString()
    });
}

export function verifyToken(token: string): JwtPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

export function decodeToken(token: string): JwtPayload | null {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch (error) {
        return null;
    }
}