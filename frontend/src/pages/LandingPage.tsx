import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Zap, 
  GitBranch, 
  MessageSquare, 
  Eye,
  ArrowRight,
  Sparkles,
  Code2,
  Lock
} from 'lucide-react';
import AuthModal from '../components/AuthModal';

const LandingPage: React.FC = () => {
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Conflict Prevention",
      description: "AI-powered analysis prevents merge conflicts before they happen"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Real-time team visibility and intelligent task coordination"
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "Smart Branching",
      description: "Intelligent branch management and conflict-free workflows"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Integrated Chat",
      description: "Context-aware team communication right in your IDE"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Code Visibility",
      description: "See what your teammates are working on in real-time"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Sync",
      description: "Lightning-fast synchronization across all team members"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/src/assets/prism-background.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Prism</h1>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setAuthModal('login')}
                className="px-6 py-2 text-white/90 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => setAuthModal('register')}
                className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 pt-20 pb-32">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">AI-Powered Development Collaboration</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Code Without
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Conflicts
              </span>
            </h1>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
              Prism revolutionizes team development with intelligent conflict detection, 
              real-time collaboration, and seamless VS Code integration. Build together, 
              merge without fear.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setAuthModal('register')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Start Collaborating</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => setAuthModal('login')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200"
              >
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">
                Intelligent Development, 
                <span className="text-purple-400"> Simplified</span>
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                Experience the future of collaborative coding with AI-powered conflict prevention 
                and seamless team synchronization.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all duration-300">
                    <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
              <Lock className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Transform Your Development Workflow?
              </h2>
              
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of developers who've eliminated merge conflicts and 
                accelerated their team collaboration with Prism.
              </p>
              
              <button 
                onClick={() => setAuthModal('register')}
                className="group px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Auth Modal */}
      {authModal && (
        <AuthModal 
          mode={authModal} 
          onClose={() => setAuthModal(null)} 
        />
      )}
    </div>
  );
};

export default LandingPage;