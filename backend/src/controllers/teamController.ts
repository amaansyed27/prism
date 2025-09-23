import { Request, Response } from 'express';
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