import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Plus, 
  ArrowLeft,
  User,
  Github,
  Mail
} from 'lucide-react';
import backgroundImage from '@/assets/prism-background.jpg';

const PrismDashboard = () => {
  const [currentPage, setCurrentPage] = useState('projects');

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
                  ? 'glass-panel bg-primary/20 text-primary border-primary/30' 
                  : 'hover:glass-panel-hover text-sidebar-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="glass-panel-hover p-4 rounded-lg flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">Developer</p>
          <p className="text-xs text-muted-foreground">developer@prism.dev</p>
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

  const DashboardPage = () => (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="font-semibold mb-2">Active Projects</h3>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>
        
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="font-semibold mb-2">Team Members</h3>
          <p className="text-3xl font-bold text-success">0</p>
        </div>
        
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="font-semibold mb-2">Tasks Completed</h3>
          <p className="text-3xl font-bold text-warning">0</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl text-center">
        <h3 className="text-xl font-semibold mb-2">Welcome to Prism</h3>
        <p className="text-muted-foreground mb-6">Start by creating your first project to begin managing your development workflow.</p>
        <button
          onClick={() => setCurrentPage('create-project')}
          className="btn-primary"
        >
          Get Started
        </button>
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