import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  ChevronDown,
  Bell,
  Search,
  Filter,
  Calendar,
  Clock
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, teams, currentTeam, logout, switchTeam } = useAuth();
  const [showTeamDropdown, setShowTeamDropdown] = React.useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/src/assets/prism-background.jpg')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Team Selector */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Prism</h1>
              </div>

              {/* Team Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
                >
                  <Users className="w-5 h-5" />
                  <span>{currentTeam?.name || 'Select Team'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showTeamDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl z-50">
                    <div className="p-4">
                      <div className="text-white/70 text-sm font-medium mb-3">Your Teams</div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {teams.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => {
                              switchTeam(team.id);
                              setShowTeamDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              currentTeam?.id === team.id
                                ? 'bg-purple-500/30 text-white'
                                : 'text-white/80 hover:bg-white/10'
                            }`}
                          >
                            <div className="font-medium">{team.name}</div>
                            <div className="text-sm text-white/60">{team.members.length} members</div>
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <button className="w-full flex items-center space-x-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Plus className="w-4 h-4" />
                          <span>Create Team</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Search and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search tasks, files, or teammates..."
                  className="pl-10 pr-4 py-2 w-80 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                <Bell className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-white/60 text-sm">{user.email}</div>
                </div>
                
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-white/70 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-white/70">
                {currentTeam ? `You're working with ${currentTeam.name}` : 'Select a team to start collaborating'}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white/80 font-medium">Active Tasks</h3>
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">12</div>
                <div className="text-green-400 text-sm">+2 from yesterday</div>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white/80 font-medium">Team Members</h3>
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{currentTeam?.members.length || 0}</div>
                <div className="text-white/60 text-sm">Active now</div>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white/80 font-medium">Conflicts Prevented</h3>
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Settings className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">47</div>
                <div className="text-green-400 text-sm">This week</div>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white/80 font-medium">Time Saved</h3>
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">8.5h</div>
                <div className="text-green-400 text-sm">This month</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                  <button className="text-white/70 hover:text-white">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">J</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">John updated task "Fix login bug"</div>
                        <div className="text-white/60 text-sm">2 minutes ago</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Start */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Quick Start</h2>

                <div className="space-y-4">
                  <button className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-xl text-left hover:from-purple-500/30 hover:to-pink-600/30 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <Plus className="w-6 h-6 text-purple-400" />
                      <div>
                        <div className="text-white font-medium">Create New Task</div>
                        <div className="text-white/60 text-sm">Start a new development task</div>
                      </div>
                    </div>
                  </button>

                  <button className="w-full p-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-xl text-left hover:from-blue-500/30 hover:to-purple-600/30 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <Users className="w-6 h-6 text-blue-400" />
                      <div>
                        <div className="text-white font-medium">Invite Team Member</div>
                        <div className="text-white/60 text-sm">Add someone to your team</div>
                      </div>
                    </div>
                  </button>

                  <button className="w-full p-4 bg-gradient-to-r from-green-500/20 to-blue-600/20 border border-green-500/30 rounded-xl text-left hover:from-green-500/30 hover:to-blue-600/30 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <Settings className="w-6 h-6 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Check Conflicts</div>
                        <div className="text-white/60 text-sm">Run conflict detection</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;