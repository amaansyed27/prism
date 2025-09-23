import { Request, Response } from 'express';

interface ConflictWarning {
  id: string;
  type: 'file-conflict' | 'dependency-conflict' | 'merge-conflict';
  severity: 'low' | 'medium' | 'high';
  message: string;
  files: string[];
  suggestedAction: string;
}

interface ContextData {
  workspaceRoot: string;
  currentFile: string;
  modifiedFiles: string[];
  activeBranch: string;
  taskDescription: string;
}

export const checkConflicts = async (req: Request, res: Response) => {
  try {
    const context: ContextData = req.body;
    const teamId = req.headers['x-team-id'] as string || 'default-team';
    
    // Simulate conflict detection logic
    // In a real implementation, this would:
    // 1. Query active tasks and their files
    // 2. Use AI (Gemini API) to analyze potential conflicts
    // 3. Check Git history and current changes
    
    const conflicts: ConflictWarning[] = [];
    
    // Demo conflicts for testing
    if (context.modifiedFiles.length > 0) {
      // Simulate finding potential conflicts
      const hasJavaScriptFiles = context.modifiedFiles.some(file => 
        file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')
      );
      
      if (hasJavaScriptFiles && context.taskDescription.toLowerCase().includes('auth')) {
        conflicts.push({
          id: 'conflict-1',
          type: 'file-conflict',
          severity: 'medium',
          message: 'Another team member is working on authentication-related files',
          files: context.modifiedFiles.filter(f => f.includes('auth')),
          suggestedAction: 'Coordinate with team member working on user authentication before proceeding'
        });
      }
      
      if (context.modifiedFiles.some(file => file.includes('package.json'))) {
        conflicts.push({
          id: 'conflict-2',
          type: 'dependency-conflict',
          severity: 'high',
          message: 'Package.json changes may conflict with ongoing dependency updates',
          files: ['package.json'],
          suggestedAction: 'Check with team before modifying dependencies'
        });
      }
    }
    
    res.json(conflicts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check conflicts' });
  }
};

export const analyzeTaskConflicts = async (req: Request, res: Response) => {
  try {
    const { taskDescription, files } = req.body;
    const teamId = req.headers['x-team-id'] as string || 'default-team';
    
    // Simulate AI analysis
    // In production, this would call the Gemini API
    const warnings: ConflictWarning[] = [];
    const suggestions: string[] = [];
    
    // Simple heuristic analysis for demo
    let canProceed = true;
    
    if (files.some((file: string) => file.includes('database') || file.includes('migration'))) {
      warnings.push({
        id: 'analysis-1',
        type: 'file-conflict',
        severity: 'high',
        message: 'Database schema changes detected',
        files: files.filter((f: string) => f.includes('database')),
        suggestedAction: 'Coordinate database changes with team to avoid migration conflicts'
      });
      canProceed = false;
    }
    
    if (taskDescription.toLowerCase().includes('deploy') || taskDescription.toLowerCase().includes('production')) {
      warnings.push({
        id: 'analysis-2',
        type: 'merge-conflict',
        severity: 'medium',
        message: 'Production deployment task detected',
        files: [],
        suggestedAction: 'Ensure all team members are aware of production deployment'
      });
      suggestions.push('Consider creating a deployment checklist');
      suggestions.push('Notify team in chat before proceeding');
    }
    
    if (canProceed && warnings.length === 0) {
      suggestions.push('No conflicts detected - safe to proceed');
      suggestions.push('Consider updating your task status to "in-progress"');
    }
    
    res.json({
      canProceed,
      warnings,
      suggestions
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze task conflicts' });
  }
};