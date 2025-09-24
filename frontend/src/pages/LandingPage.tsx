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
  Lock,
  Plus
} from 'lucide-react';
import AuthModal from '../components/AuthModal';
import backgroundImage from '@/assets/prism-background.jpg';

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
    <div 
      className="dark min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Prism</h1>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setAuthModal('login')}
                className="btn-secondary"
              >
                Sign In
              </button>
              <button 
                onClick={() => setAuthModal('register')}
                className="btn-primary"
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
              <div className="inline-flex items-center space-x-2 glass-panel px-6 py-3 mb-8 border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-foreground text-sm font-medium">AI-Powered Development Collaboration</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
              Code Without
              <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Conflicts
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              Prism revolutionizes team development with intelligent conflict detection, 
              real-time collaboration, and seamless VS Code integration. Build together, 
              merge without fear.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setAuthModal('register')}
                className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
              >
                <span>Start Collaborating</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setAuthModal('login')}
                className="btn-secondary text-lg px-8 py-4"
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
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Intelligent Development, 
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> Simplified</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Experience the future of collaborative coding with AI-powered conflict prevention 
                and seamless team synchronization.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="glass-panel p-8 rounded-2xl hover:glass-panel-hover transition-all duration-300 hover:transform hover:scale-105 border border-border"
                >
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
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
            <div className="glass-panel p-12 rounded-3xl border border-primary/20">
              <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
              
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Ready to Transform Your Development Workflow?
              </h2>
              
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of developers who've eliminated merge conflicts and 
                accelerated their team collaboration with Prism.
              </p>
              
              <button 
                onClick={() => setAuthModal('register')}
                className="btn-primary flex items-center space-x-2 mx-auto text-lg px-10 py-4"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
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