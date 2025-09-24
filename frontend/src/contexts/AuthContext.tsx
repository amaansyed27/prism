import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  currentTeam?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  members: Array<{
    user: string;
    role: 'admin' | 'member';
    joinedAt: Date;
  }>;
}

interface AuthContextType {
  user: User | null;
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createTeam: (name: string, description: string) => Promise<Team | null>;
  joinTeam: (inviteCode: string) => Promise<boolean>;
  switchTeam: (teamId: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Configure axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://prism-0eo7.onrender.com/api',
  withCredentials: true,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('prism_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('prism_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('prism_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      const userData = response.data.user;
      setUser(userData);

      // Fetch user's teams
      const teamsResponse = await api.get('/auth/teams');
      setTeams(teamsResponse.data);

      // Set current team
      if (userData.currentTeam) {
        const currentTeamData = teamsResponse.data.find((t: Team) => t.id === userData.currentTeam);
        setCurrentTeam(currentTeamData || null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      localStorage.removeItem('prism_token');
      setUser(null);
      setTeams([]);
      setCurrentTeam(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('prism_token', token);
      setUser(userData);
      
      // Fetch teams after login
      await refreshUser();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('prism_token', token);
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('prism_token');
    setUser(null);
    setTeams([]);
    setCurrentTeam(null);
  };

  const createTeam = async (name: string, description: string): Promise<Team | null> => {
    try {
      const response = await api.post('/auth/teams', { name, description });
      const newTeam = response.data;
      
      setTeams(prev => [...prev, newTeam]);
      setCurrentTeam(newTeam);
      
      // Update user's current team
      await api.patch('/auth/switch-team', { teamId: newTeam.id });
      
      return newTeam;
    } catch (error) {
      console.error('Failed to create team:', error);
      return null;
    }
  };

  const joinTeam = async (inviteCode: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/join-team', { inviteCode });
      const team = response.data;
      
      setTeams(prev => [...prev, team]);
      setCurrentTeam(team);
      
      // Update user's current team
      await api.patch('/auth/switch-team', { teamId: team.id });
      
      return true;
    } catch (error) {
      console.error('Failed to join team:', error);
      return false;
    }
  };

  const switchTeam = async (teamId: string): Promise<boolean> => {
    try {
      await api.patch('/auth/switch-team', { teamId });
      const team = teams.find(t => t.id === teamId);
      setCurrentTeam(team || null);
      
      // Update user object
      setUser(prev => prev ? { ...prev, currentTeam: teamId } : null);
      
      return true;
    } catch (error) {
      console.error('Failed to switch team:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const contextValue: AuthContextType = {
    user,
    teams,
    currentTeam,
    isLoading,
    login,
    register,
    logout,
    createTeam,
    joinTeam,
    switchTeam,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { api };