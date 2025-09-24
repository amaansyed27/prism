import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { TeamController } from '../controllers/teamController';
import { authenticateToken, optionalAuth } from '../middlewares/auth';

const router = Router();

// Authentication routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', authenticateToken, AuthController.logout);

// Profile routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.patch('/profile', authenticateToken, AuthController.updateProfile);
router.post('/switch-team', authenticateToken, AuthController.switchTeam);

// Team management routes
router.post('/teams', authenticateToken, TeamController.createTeam);
router.post('/teams/join', authenticateToken, TeamController.joinTeamByInvite);
router.get('/teams', authenticateToken, TeamController.getUserTeams);
router.get('/teams/:teamId', authenticateToken, TeamController.getTeamById);

export default router;