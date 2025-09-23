import { Router } from 'express';
import { getStatus } from '../controllers/statusController';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { getTeamMembers, updateMyStatus, addTeamMember } from '../controllers/teamController';
import { checkConflicts, analyzeTaskConflicts } from '../controllers/conflictController';
import { sendMessage, getChatHistory } from '../controllers/chatController';

const router = Router();

// Status endpoint
router.get('/status', getStatus);

// Task management endpoints
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.patch('/tasks/:taskId', updateTask);
router.delete('/tasks/:taskId', deleteTask);

// Team management endpoints
router.get('/team', getTeamMembers);
router.patch('/team/me', updateMyStatus);
router.post('/team', addTeamMember);

// Conflict detection endpoints
router.post('/conflicts/check', checkConflicts);
router.post('/conflicts/analyze', analyzeTaskConflicts);

// Chat endpoints
router.post('/chat/message', sendMessage);
router.get('/chat/history', getChatHistory);

export default router;
