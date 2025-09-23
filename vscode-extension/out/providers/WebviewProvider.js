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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismWebviewProvider = void 0;
const vscode = __importStar(require("vscode"));
class PrismWebviewProvider {
    constructor(context, apiClient) {
        this.context = context;
        this.apiClient = apiClient;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };
        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'startTask':
                    await this.handleStartTask(data.taskDescription, data.files);
                    break;
                case 'sendChatMessage':
                    await this.handleChatMessage(data.message);
                    break;
                case 'checkConflicts':
                    vscode.commands.executeCommand('prism.checkConflicts');
                    break;
                case 'updateTaskStatus':
                    await this.handleUpdateTaskStatus(data.taskId, data.status);
                    break;
                case 'openDashboard':
                    this.openDashboard();
                    break;
            }
        });
        // Update webview content periodically
        this.updateWebviewContent();
        if (typeof setInterval !== 'undefined') {
            setInterval(() => {
                this.updateWebviewContent();
            }, 30000); // Update every 30 seconds
        }
    }
    async updateWebviewContent() {
        if (this._view) {
            const tasks = await this.apiClient.getTasks();
            const teamMembers = await this.apiClient.getTeamMembers();
            this._view.webview.postMessage({
                type: 'updateData',
                tasks,
                teamMembers
            });
        }
    }
    async handleStartTask(taskDescription, files) {
        try {
            // Check for conflicts before starting
            const analysis = await this.apiClient.analyzeTaskConflicts(taskDescription, files);
            if (!analysis.canProceed) {
                vscode.window.showWarningMessage('Potential conflicts detected! Review warnings before proceeding.', 'View Details', 'Proceed Anyway').then(selection => {
                    if (selection === 'View Details') {
                        // Show conflict details
                        this.showConflictDetails(analysis.warnings);
                    }
                    else if (selection === 'Proceed Anyway') {
                        this.createTask(taskDescription, files);
                    }
                });
            }
            else {
                this.createTask(taskDescription, files);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to analyze task for conflicts');
        }
    }
    async createTask(taskDescription, files) {
        const task = await this.apiClient.createTask({
            title: taskDescription,
            description: taskDescription,
            status: 'in-progress',
            files: files,
            priority: 'medium',
            assignee: 'current-user'
        });
        if (task) {
            vscode.window.showInformationMessage(`✅ Task started: ${task.title}`);
            this.updateWebviewContent();
        }
    }
    async handleChatMessage(message) {
        await this.apiClient.sendMessage(message);
        this.updateWebviewContent();
    }
    async handleUpdateTaskStatus(taskId, status) {
        await this.apiClient.updateTask(taskId, { status: status });
        this.updateWebviewContent();
    }
    showConflictDetails(warnings) {
        const panel = vscode.window.createWebviewPanel('prismConflictDetails', 'Conflict Analysis', vscode.ViewColumn.Two, { enableScripts: true });
        panel.webview.html = this.getConflictDetailsHtml(warnings);
    }
    openDashboard() {
        const config = vscode.workspace.getConfiguration('prism');
        const apiUrl = config.get('apiUrl', 'http://localhost:5000');
        const dashboardUrl = apiUrl.replace(':5000', ':5173'); // Assume frontend on 5173
        vscode.env.openExternal(vscode.Uri.parse(dashboardUrl));
    }
    async showStartTaskPanel() {
        const taskDescription = await vscode.window.showInputBox({
            prompt: 'Describe the task you want to start',
            placeHolder: 'e.g., Implement user authentication feature'
        });
        if (taskDescription) {
            const files = this.getCurrentWorkspaceFiles();
            await this.handleStartTask(taskDescription, files);
        }
    }
    openChat() {
        if (this._view) {
            this._view.webview.postMessage({ type: 'focusChat' });
            this._view.show(true);
        }
    }
    getCurrentWorkspaceFiles() {
        const activeEditor = vscode.window.activeTextEditor;
        const files = [];
        if (activeEditor) {
            files.push(activeEditor.document.fileName);
        }
        // Add any modified files
        const modifiedFiles = vscode.workspace.textDocuments
            .filter(doc => doc.isDirty && !doc.isUntitled)
            .map(doc => doc.fileName);
        files.push(...modifiedFiles);
        return [...new Set(files)]; // Remove duplicates
    }
    getHtmlForWebview(webview) {
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prism Dashboard</title>
    <link href="${codiconsUri}" rel="stylesheet" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 16px;
            line-height: 1.5;
        }

        .prism-container {
            max-width: 100%;
            margin: 0 auto;
        }

        .prism-header {
            text-align: center;
            margin-bottom: 24px;
            padding: 20px;
            background: linear-gradient(135deg, 
                var(--vscode-badge-background) 0%, 
                var(--vscode-progressBar-background) 100%);
            border-radius: 12px;
            position: relative;
            overflow: hidden;
        }

        .prism-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
            pointer-events: none;
        }

        .prism-logo {
            font-size: 24px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .prism-tagline {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.9;
        }

        .glass-panel {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            transition: all 0.3s ease;
        }

        .glass-panel:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--vscode-textLink-foreground);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .section-title .codicon {
            font-size: 18px;
        }

        .quick-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 16px;
        }

        .action-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 8px;
            padding: 12px 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .action-btn:hover {
            background: var(--vscode-button-hoverBackground);
            transform: scale(1.02);
        }

        .action-btn.primary {
            background: var(--vscode-textLink-foreground);
            color: white;
        }

        .action-btn.secondary {
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
        }

        .task-item, .team-member {
            background: var(--vscode-list-hoverBackground);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            border-left: 3px solid var(--vscode-textLink-foreground);
            transition: all 0.2s ease;
        }

        .task-item:hover, .team-member:hover {
            background: var(--vscode-list-activeSelectionBackground);
            transform: translateX(4px);
        }

        .task-title, .member-name {
            font-weight: 600;
            margin-bottom: 4px;
            color: var(--vscode-foreground);
        }

        .task-desc, .member-status {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            line-height: 1.4;
        }

        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-online { background: var(--vscode-testing-iconPassed); color: white; }
        .status-busy { background: var(--vscode-notificationsWarningIcon-foreground); color: white; }
        .status-offline { background: var(--vscode-disabledForeground); color: white; }

        .chat-container {
            max-height: 200px;
            overflow-y: auto;
            margin-bottom: 12px;
        }

        .chat-input {
            width: 100%;
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 8px;
            padding: 8px 12px;
            color: var(--vscode-input-foreground);
            font-size: 12px;
        }

        .chat-input:focus {
            outline: none;
            border-color: var(--vscode-textLink-foreground);
            box-shadow: 0 0 0 2px rgba(var(--vscode-textLink-foreground), 0.2);
        }

        .empty-state {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
        }

        .conflict-indicator {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--vscode-testing-iconPassed);
            animation: pulse 2s infinite;
        }

        .conflict-indicator.warning {
            background: var(--vscode-notificationsWarningIcon-foreground);
        }

        .conflict-indicator.error {
            background: var(--vscode-errorForeground);
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }

        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }

        .loading .codicon {
            animation: spin 1s linear infinite;
            margin-right: 8px;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="prism-container">
        <!-- Header -->
        <div class="prism-header">
            <div class="prism-logo">🎯 Prism</div>
            <div class="prism-tagline">Intelligent Collaboration for Modern Teams</div>
            <div id="conflict-indicator" class="conflict-indicator"></div>
        </div>

        <!-- Quick Actions -->
        <div class="glass-panel">
            <div class="section-title">
                <i class="codicon codicon-zap"></i>
                Quick Actions
            </div>
            <div class="quick-actions">
                <button class="action-btn primary" onclick="startTask()">
                    <i class="codicon codicon-play"></i>
                    Start Task
                </button>
                <button class="action-btn secondary" onclick="checkConflicts()">
                    <i class="codicon codicon-warning"></i>
                    Check Conflicts
                </button>
                <button class="action-btn secondary" onclick="openDashboard()">
                    <i class="codicon codicon-globe"></i>
                    Dashboard
                </button>
                <button class="action-btn secondary" onclick="focusChat()">
                    <i class="codicon codicon-comment-discussion"></i>
                    Team Chat
                </button>
            </div>
        </div>

        <!-- My Tasks -->
        <div class="glass-panel">
            <div class="section-title">
                <i class="codicon codicon-checklist"></i>
                My Tasks
            </div>
            <div id="tasks-container">
                <div class="loading">
                    <i class="codicon codicon-loading"></i>
                    Loading tasks...
                </div>
            </div>
        </div>

        <!-- Team Status -->
        <div class="glass-panel">
            <div class="section-title">
                <i class="codicon codicon-organization"></i>
                Team Status
            </div>
            <div id="team-container">
                <div class="loading">
                    <i class="codicon codicon-loading"></i>
                    Loading team...
                </div>
            </div>
        </div>

        <!-- Quick Chat -->
        <div class="glass-panel">
            <div class="section-title">
                <i class="codicon codicon-comment"></i>
                Quick Chat
            </div>
            <div id="chat-container" class="chat-container">
                <div class="empty-state">Start a conversation with your team</div>
            </div>
            <input type="text" id="chat-input" class="chat-input" placeholder="Type a message..." onkeypress="handleChatInput(event)">
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'updateData':
                    updateTasks(message.tasks);
                    updateTeam(message.teamMembers);
                    break;
                case 'focusChat':
                    document.getElementById('chat-input').focus();
                    break;
            }
        });

        function startTask() {
            vscode.postMessage({ type: 'startTask' });
        }

        function checkConflicts() {
            vscode.postMessage({ type: 'checkConflicts' });
        }

        function openDashboard() {
            vscode.postMessage({ type: 'openDashboard' });
        }

        function focusChat() {
            document.getElementById('chat-input').focus();
        }

        function handleChatInput(event) {
            if (event.key === 'Enter') {
                const input = event.target;
                const message = input.value.trim();
                if (message) {
                    vscode.postMessage({ 
                        type: 'sendChatMessage', 
                        message: message 
                    });
                    input.value = '';
                }
            }
        }

        function updateTasks(tasks) {
            const container = document.getElementById('tasks-container');
            if (!tasks || tasks.length === 0) {
                container.innerHTML = '<div class="empty-state">No active tasks</div>';
                return;
            }

            container.innerHTML = tasks.slice(0, 3).map(task => 
                \`<div class="task-item" onclick="updateTaskStatus('\${task.id}', 'done')">
                    <div class="task-title">\${task.title}</div>
                    <div class="task-desc">\${task.description || 'No description'}</div>
                </div>\`
            ).join('');
        }

        function updateTeam(teamMembers) {
            const container = document.getElementById('team-container');
            if (!teamMembers || teamMembers.length === 0) {
                container.innerHTML = '<div class="empty-state">No team members</div>';
                return;
            }

            container.innerHTML = teamMembers.slice(0, 4).map(member => 
                \`<div class="team-member">
                    <div class="member-name">\${member.name}</div>
                    <div class="member-status">
                        <span class="status-badge status-\${member.status}">\${member.status}</span>
                        \${member.currentTask ? \` • \${member.currentTask}\` : ''}
                    </div>
                </div>\`
            ).join('');
        }

        function updateTaskStatus(taskId, status) {
            vscode.postMessage({ 
                type: 'updateTaskStatus', 
                taskId: taskId, 
                status: status 
            });
        }

        // Initialize
        setTimeout(() => {
            vscode.postMessage({ type: 'init' });
        }, 100);
    </script>
</body>
</html>`;
    }
    getConflictDetailsHtml(warnings) {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Conflict Analysis</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
        }
        .warning {
            background: var(--vscode-inputValidation-warningBackground);
            border: 1px solid var(--vscode-inputValidation-warningBorder);
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <h1>🚨 Conflict Analysis</h1>
    ${warnings.map(w => `
        <div class="warning">
            <h3>${w.message}</h3>
            <p><strong>Action:</strong> ${w.suggestedAction}</p>
        </div>
    `).join('')}
</body>
</html>`;
    }
}
exports.PrismWebviewProvider = PrismWebviewProvider;
PrismWebviewProvider.viewType = 'prism.dashboard';
//# sourceMappingURL=WebviewProvider.js.map