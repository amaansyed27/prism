import { Request, Response } from 'express';
import { Task } from '../models/Task';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const teamId = req.headers['x-team-id'] as string || 'default-team';
    const tasks = await Task.find({ teamId }).sort({ updatedAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const teamId = req.headers['x-team-id'] as string || 'default-team';
    const taskData = {
      ...req.body,
      teamId
    };
    
    const task = new Task(taskData);
    await task.save();
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const teamId = req.headers['x-team-id'] as string || 'default-team';
    
    const task = await Task.findOneAndUpdate(
      { _id: taskId, teamId },
      req.body,
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const teamId = req.headers['x-team-id'] as string || 'default-team';
    
    const task = await Task.findOneAndDelete({ _id: taskId, teamId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};