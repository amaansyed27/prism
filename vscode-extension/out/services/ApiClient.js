"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
class ApiClient {
    constructor() {
        this.config = vscode.workspace.getConfiguration('prism');
        const apiUrl = this.config.get('apiUrl', 'http://localhost:5000');
        this.client = axios_1.default.create({
            baseURL: apiUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Add request interceptor for authentication
        this.client.interceptors.request.use((config) => {
            const teamId = this.config.get('teamId');
            if (teamId) {
                config.headers['X-Team-ID'] = teamId;
            }
            return config;
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            this.handleApiError(error);
            return Promise.reject(error);
        });
    }
    handleApiError(error) {
        if (error.response) {
            vscode.window.showErrorMessage(`Prism API Error: ${error.response.data.message || error.message}`);
        }
        else if (error.request) {
            vscode.window.showErrorMessage('Prism: Unable to connect to backend. Please check your connection.');
        }
        else {
            vscode.window.showErrorMessage(`Prism Error: ${error.message}`);
        }
    }
    // Task Management
    async getTasks() {
        try {
            const response = await this.client.get('/api/tasks');
            return response.data;
        }
        catch (error) {
            return [];
        }
    }
    async createTask(task) {
        try {
            const response = await this.client.post('/api/tasks', task);
            return response.data;
        }
        catch (error) {
            return null;
        }
    }
    async updateTask(taskId, updates) {
        try {
            const response = await this.client.patch(`/api/tasks/${taskId}`, updates);
            return response.data;
        }
        catch (error) {
            return null;
        }
    }
    // Team Management
    async getTeamMembers() {
        try {
            const response = await this.client.get('/api/team');
            return response.data;
        }
        catch (error) {
            return [];
        }
    }
    async updateMyStatus(status, currentTask) {
        try {
            await this.client.patch('/api/team/me', { status, currentTask });
        }
        catch (error) {
            // Handle silently for status updates
        }
    }
    // Conflict Detection
    async checkConflicts(context) {
        try {
            const response = await this.client.post('/api/conflicts/check', context);
            return response.data;
        }
        catch (error) {
            return [];
        }
    }
    async analyzeTaskConflicts(taskDescription, files) {
        try {
            const response = await this.client.post('/api/conflicts/analyze', {
                taskDescription,
                files
            });
            return response.data;
        }
        catch (error) {
            return {
                canProceed: true,
                warnings: [],
                suggestions: []
            };
        }
    }
    // Health Check
    async checkConnection() {
        try {
            await this.client.get('/api/status');
            return true;
        }
        catch (error) {
            return false;
        }
    }
    // Chat & Collaboration
    async sendMessage(message, type = 'chat') {
        try {
            await this.client.post('/api/chat/message', { message, type });
        }
        catch (error) {
            // Handle silently for chat messages
        }
    }
    async getChatHistory(limit = 50) {
        try {
            const response = await this.client.get(`/api/chat/history?limit=${limit}`);
            return response.data;
        }
        catch (error) {
            return [];
        }
    }
}
exports.ApiClient = ApiClient;
//# sourceMappingURL=ApiClient.js.map