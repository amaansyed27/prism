import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    assignee: string;
    files: string[];
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    status: 'online' | 'offline' | 'busy';
    currentTask?: string;
}

export interface ConflictWarning {
    id: string;
    type: 'file-conflict' | 'dependency-conflict' | 'merge-conflict';
    severity: 'low' | 'medium' | 'high';
    message: string;
    files: string[];
    suggestedAction: string;
}

export interface ContextData {
    workspaceRoot: string;
    currentFile: string;
    modifiedFiles: string[];
    activeBranch: string;
    taskDescription: string;
}

export class ApiClient {
    private client: AxiosInstance;
    private config: vscode.WorkspaceConfiguration;

    constructor() {
        this.config = vscode.workspace.getConfiguration('prism');
        const apiUrl = this.config.get<string>('apiUrl', 'http://localhost:5000');
        
        this.client = axios.create({
            baseURL: apiUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor for authentication
        this.client.interceptors.request.use((config) => {
            const teamId = this.config.get<string>('teamId');
            if (teamId) {
                config.headers['X-Team-ID'] = teamId;
            }
            return config;
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                this.handleApiError(error);
                return Promise.reject(error);
            }
        );
    }

    private handleApiError(error: any) {
        if (error.response) {
            vscode.window.showErrorMessage(`Prism API Error: ${error.response.data.message || error.message}`);
        } else if (error.request) {
            vscode.window.showErrorMessage('Prism: Unable to connect to backend. Please check your connection.');
        } else {
            vscode.window.showErrorMessage(`Prism Error: ${error.message}`);
        }
    }

    // Task Management
    async getTasks(): Promise<Task[]> {
        try {
            const response = await this.client.get('/api/tasks');
            return response.data;
        } catch (error) {
            return [];
        }
    }

    async createTask(task: Partial<Task>): Promise<Task | null> {
        try {
            const response = await this.client.post('/api/tasks', task);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
        try {
            const response = await this.client.patch(`/api/tasks/${taskId}`, updates);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    // Team Management
    async getTeamMembers(): Promise<TeamMember[]> {
        try {
            const response = await this.client.get('/api/team');
            return response.data;
        } catch (error) {
            return [];
        }
    }

    async updateMyStatus(status: TeamMember['status'], currentTask?: string): Promise<void> {
        try {
            await this.client.patch('/api/team/me', { status, currentTask });
        } catch (error) {
            // Handle silently for status updates
        }
    }

    // Conflict Detection
    async checkConflicts(context: ContextData): Promise<ConflictWarning[]> {
        try {
            const response = await this.client.post('/api/conflicts/check', context);
            return response.data;
        } catch (error) {
            return [];
        }
    }

    async analyzeTaskConflicts(taskDescription: string, files: string[]): Promise<{
        canProceed: boolean;
        warnings: ConflictWarning[];
        suggestions: string[];
    }> {
        try {
            const response = await this.client.post('/api/conflicts/analyze', {
                taskDescription,
                files
            });
            return response.data;
        } catch (error) {
            return {
                canProceed: true,
                warnings: [],
                suggestions: []
            };
        }
    }

    // Health Check
    async checkConnection(): Promise<boolean> {
        try {
            await this.client.get('/api/status');
            return true;
        } catch (error) {
            return false;
        }
    }

    // Chat & Collaboration
    async sendMessage(message: string, type: 'chat' | 'checklist' = 'chat'): Promise<void> {
        try {
            await this.client.post('/api/chat/message', { message, type });
        } catch (error) {
            // Handle silently for chat messages
        }
    }

    async getChatHistory(limit: number = 50): Promise<any[]> {
        try {
            const response = await this.client.get(`/api/chat/history?limit=${limit}`);
            return response.data;
        } catch (error) {
            return [];
        }
    }
}