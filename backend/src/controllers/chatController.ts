import { Request, Response } from 'express';
import { ChatMessage } from '../models/ChatMessage';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const teamId = req.headers['x-team-id'] as string || 'default-team';
    const { message, type, sender } = req.body;
    
    const chatMessage = new ChatMessage({
      message,
      type: type || 'chat',
      sender: sender || 'VS Code Extension',
      teamId
    });
    
    await chatMessage.save();
    res.status(201).json(chatMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const teamId = req.headers['x-team-id'] as string || 'default-team';
    const limit = parseInt(req.query.limit as string) || 50;
    
    const messages = await ChatMessage.find({ teamId })
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};