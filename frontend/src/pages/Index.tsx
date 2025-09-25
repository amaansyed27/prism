import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Plus, 
  ArrowLeft,
  User,
  Github,
  Mail,
  LogOut,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Code,
  GitBranch,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import backgroundImage from '@/assets/prism-background.jpg';

interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl?: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
}

const PrismDashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, logout, currentTeam, teams, switchTeam } = useAuth();
  
  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    repositoryUrl: ''
  });
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    projectId: ''
  });

  const [inviteEmail, setInviteEmail] = useState('');

  // Load data when component mounts or team changes
  useEffect(() => {
    if (currentTeam?.id) {
      loadProjects();
      loadTasks();
      loadTeamMembers();
    }
  }, [currentTeam?.id]);

  // API Calls
  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects?teamId=${currentTeam?.id}`);
      setProjects(response.data || []);
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      // For demo purposes, use mock data
      setProjects([
        {
          id: '1',
          name: 'Main Application',
          description: 'Primary web application with React and Node.js',
          repositoryUrl: 'https://github.com/team/main-app',
          teamId: currentTeam?.id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'API Service',
          description: 'Backend API service with authentication and database',
          repositoryUrl: 'https://github.com/team/api-service',
          teamId: currentTeam?.id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await api.get(`/tasks?teamId=${currentTeam?.id}`);
      setTasks(response.data || []);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      // Mock data for demo
      setTasks([
        {
          id: '1',
          title: 'Implement user authentication',
          description: 'Add JWT-based authentication system',
          status: 'in-progress',
          priority: 'high',
          projectId: '1',
          assignedTo: user?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Setup database migrations',
          description: 'Create migration scripts for user and team tables',
          status: 'todo',
          priority: 'medium',
          projectId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Design landing page',
          description: 'Create wireframes and mockups for landing page',
          status: 'done',
          priority: 'low',
          projectId: '1',
          assignedTo: user?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const response = await api.get(`/teams/${currentTeam?.id}`);
      setTeamMembers(response.data?.members || []);
    } catch (error: any) {
      console.error('Failed to load team members:', error);
      // Mock data
      setTeamMembers([
        { id: user?.id || '1', name: user?.name || 'You', email: user?.email || 'you@example.com', role: 'owner' },
        { id: '2', name: 'John Doe', email: 'john@example.com', role: 'member' },
        { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'member' }
      ]);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam?.id) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/projects', {
        ...newProject,
        teamId: currentTeam.id
      });
      
      setProjects(prev => [...prev, response.data]);
      setNewProject({ name: '', description: '', repositoryUrl: '' });
      setCurrentPage('projects');
    } catch (error: any) {
      setError('Failed to create project');
      console.error('Create project failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam?.id || !newTask.projectId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/tasks', {
        ...newTask,
        teamId: currentTeam.id,
        status: 'todo',
        assignedTo: user?.id
      });
      
      setTasks(prev => [...prev, response.data]);
      setNewTask({ title: '', description: '', priority: 'medium', projectId: '' });
      setCurrentPage('projects');
    } catch (error: any) {
      setError('Failed to create task');
      console.error('Create task failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get stats
  const stats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    teamMembers: teamMembers.length
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', name: 'Projects', icon: FolderOpen },
    { id: 'team', name: 'Team', icon: Users },
  ];

  const Sidebar = () => (
    <div className="glass-sidebar fixed left-0 top-0 h-full w-64 p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Prism
        </h1>
        {currentTeam && (
          <p className="text-xs text-muted-foreground mt-1">{currentTeam.name}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || 
            (item.id === 'projects' && ['create-project', 'task-board', 'create-task'].includes(currentPage)) ||
            (item.id === 'team' && currentPage === 'invite-member');
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isActive 
                  ? 'glass-panel-hover border border-primary/30 text-primary' 
                  : 'hover:glass-panel text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="space-y-3">
        <div className="glass-panel p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardPage = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your team's development activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completedTasks}</p>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.inProgressTasks}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.teamMembers}</p>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 glass-panel rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'done' ? 'bg-green-500' : 
                    task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium text-foreground text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{task.status.replace('-', ' ')}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {task.priority}
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No tasks yet. Create your first task!</p>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentPage('create-project')}
              className="w-full p-4 glass-panel border border-border rounded-lg hover:glass-panel-hover transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Create New Project</p>
                  <p className="text-sm text-muted-foreground">Start a new collaborative project</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setCurrentPage('create-task')}
              className="w-full p-4 glass-panel border border-border rounded-lg hover:glass-panel-hover transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium text-foreground">Add New Task</p>
                  <p className="text-sm text-muted-foreground">Create a development task</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setCurrentPage('invite-member')}
              className="w-full p-4 glass-panel border border-border rounded-lg hover:glass-panel-hover transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium text-foreground">Invite Team Member</p>
                  <p className="text-sm text-muted-foreground">Add someone to your team</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ProjectsPage = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button
          onClick={() => setCurrentPage('create-project')}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="glass-panel p-12 text-center rounded-2xl">
        <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No projects created yet</h3>
        <p className="text-muted-foreground mb-6">Get started by creating your first project.</p>
        <button
          onClick={() => setCurrentPage('create-project')}
          className="btn-primary"
        >
          Create Your First Project
        </button>
      </div>
    </div>
  );

  const CreateProjectPage = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => setCurrentPage('projects')}
          className="btn-secondary flex items-center space-x-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>
        <h1 className="text-3xl font-bold">Create a New Project</h1>
      </div>

      <div className="glass-form p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Project Name</label>
            <input
              type="text"
              placeholder="Enter project name"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">GitHub Repository URL</label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="url"
                placeholder="https://github.com/username/repository"
                className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button className="btn-primary flex-1">Save Project</button>
            <button
              onClick={() => setCurrentPage('projects')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TaskBoardPage = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => setCurrentPage('projects')}
            className="btn-secondary flex items-center space-x-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>
          <h1 className="text-3xl font-bold">Project Name</h1>
        </div>
        <button
          onClick={() => setCurrentPage('create-task')}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-6">
        {['To-Do', 'In Progress', 'Needs Review', 'Done'].map((column) => (
          <div key={column} className="glass-column p-6 min-h-96">
            <h3 className="font-semibold mb-4 text-center">{column}</h3>
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">No tasks yet</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CreateTaskPage = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => setCurrentPage('task-board')}
          className="btn-secondary flex items-center space-x-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Board</span>
        </button>
        <h1 className="text-3xl font-bold">Create a New Task</h1>
      </div>

      <div className="glass-form p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Task Title</label>
            <input
              type="text"
              placeholder="Enter task title"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              rows={6}
              placeholder="Describe the task..."
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button className="btn-primary flex-1">Save Task</button>
            <button
              onClick={() => setCurrentPage('task-board')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TeamPage = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <button
          onClick={() => setCurrentPage('invite-member')}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="glass-panel p-12 text-center rounded-2xl">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No team members yet</h3>
        <p className="text-muted-foreground mb-6">You haven't invited any team members yet.</p>
        <button
          onClick={() => setCurrentPage('invite-member')}
          className="btn-primary"
        >
          Invite Your First Member
        </button>
      </div>
    </div>
  );

  const InviteMemberPage = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => setCurrentPage('team')}
          className="btn-secondary flex items-center space-x-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Team</span>
        </button>
        <h1 className="text-3xl font-bold">Invite a New Team Member</h1>
      </div>

      <div className="glass-form p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="colleague@company.com"
                className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button className="btn-primary flex-1">Send Invite</button>
            <button
              onClick={() => setCurrentPage('team')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'create-project':
        return <CreateProjectPage />;
      case 'task-board':
        return <TaskBoardPage />;
      case 'create-task':
        return <CreateTaskPage />;
      case 'team':
        return <TeamPage />;
      case 'invite-member':
        return <InviteMemberPage />;
      default:
        return <ProjectsPage />;
    }
  };

  return (
    <div 
      className="dark min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Sidebar />
      <main className="ml-64 p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default PrismDashboard;