import * as vscode from 'vscode';
import { ApiClient, ContextData, ConflictWarning } from './ApiClient';

export class ConflictChecker {
    private apiClient: ApiClient;
    private checkInterval?: NodeJS.Timeout;
    private statusBarItem: vscode.StatusBarItem;

    constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'prism.checkConflicts';
        this.updateStatusBar('idle');
        this.statusBarItem.show();
    }

    private updateStatusBar(status: 'idle' | 'checking' | 'safe' | 'warning' | 'error') {
        switch (status) {
            case 'idle':
                this.statusBarItem.text = '$(symbol-namespace) Prism: Ready';
                this.statusBarItem.backgroundColor = undefined;
                this.statusBarItem.tooltip = 'Click to check for conflicts';
                break;
            case 'checking':
                this.statusBarItem.text = '$(loading~spin) Prism: Checking...';
                this.statusBarItem.backgroundColor = undefined;
                this.statusBarItem.tooltip = 'Analyzing workspace for conflicts';
                break;
            case 'safe':
                this.statusBarItem.text = '$(check) Prism: Safe to Proceed';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
                this.statusBarItem.tooltip = 'No conflicts detected';
                break;
            case 'warning':
                this.statusBarItem.text = '$(warning) Prism: Conflicts Detected';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                this.statusBarItem.tooltip = 'Potential conflicts found - click for details';
                break;
            case 'error':
                this.statusBarItem.text = '$(error) Prism: Connection Error';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                this.statusBarItem.tooltip = 'Unable to connect to Prism backend';
                break;
        }
    }

    public async checkCurrentWorkspace(): Promise<ConflictWarning[]> {
        this.updateStatusBar('checking');

        try {
            const context = await this.gatherWorkspaceContext();
            const conflicts = await this.apiClient.checkConflicts(context);

            if (conflicts.length === 0) {
                this.updateStatusBar('safe');
                vscode.window.showInformationMessage(
                    '✅ No conflicts detected! Safe to proceed with your changes.',
                    'Continue Coding'
                );
            } else {
                this.updateStatusBar('warning');
                this.showConflictWarnings(conflicts);
            }

            return conflicts;
        } catch (error) {
            this.updateStatusBar('error');
            vscode.window.showErrorMessage('Failed to check for conflicts. Please check your connection.');
            return [];
        }
    }

    private async gatherWorkspaceContext(): Promise<ContextData> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workspaceRoot = workspaceFolders ? workspaceFolders[0].uri.fsPath : '';
        
        const activeEditor = vscode.window.activeTextEditor;
        const currentFile = activeEditor ? activeEditor.document.fileName : '';

        // Get modified files from Git
        const modifiedFiles = await this.getModifiedFiles();
        
        // Get current branch
        const activeBranch = await this.getCurrentBranch();

        // Get task description from current context (could be from comments, commit messages, etc.)
        const taskDescription = await this.inferTaskDescription();

        return {
            workspaceRoot,
            currentFile,
            modifiedFiles,
            activeBranch,
            taskDescription
        };
    }

    private async getModifiedFiles(): Promise<string[]> {
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (gitExtension && gitExtension.isActive) {
                const git = gitExtension.exports.getAPI(1);
                const repo = git.repositories[0];
                if (repo) {
                    const changes = repo.state.workingTreeChanges;
                    return changes.map((change: any) => change.uri.fsPath);
                }
            }
        } catch (error) {
            // Fallback to checking dirty files
        }

        // Fallback: get dirty (unsaved) files
        return vscode.workspace.textDocuments
            .filter(doc => doc.isDirty && !doc.isUntitled)
            .map(doc => doc.fileName);
    }

    private async getCurrentBranch(): Promise<string> {
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (gitExtension && gitExtension.isActive) {
                const git = gitExtension.exports.getAPI(1);
                const repo = git.repositories[0];
                if (repo && repo.state.HEAD) {
                    return repo.state.HEAD.name || 'main';
                }
            }
        } catch (error) {
            // Ignore error
        }
        return 'main';
    }

    private async inferTaskDescription(): Promise<string> {
        // Try to infer from various sources
        const sources = [
            await this.getFromCurrentCommitMessage(),
            await this.getFromFileComments(),
            await this.getFromBranchName()
        ];

        return sources.filter(Boolean).join(' | ') || 'Working on current changes';
    }

    private async getFromCurrentCommitMessage(): Promise<string> {
        // This would require Git API integration
        return '';
    }

    private async getFromFileComments(): Promise<string> {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const text = activeEditor.document.getText();
            // Look for TODO, FIXME, or other task-related comments
            const todoMatch = text.match(/(?:TODO|FIXME|HACK|NOTE):\s*(.+)/i);
            if (todoMatch) {
                return todoMatch[1].trim();
            }
        }
        return '';
    }

    private async getFromBranchName(): Promise<string> {
        const branch = await this.getCurrentBranch();
        // Convert branch names like "feature/user-auth" to readable description
        return branch.replace(/[-_]/g, ' ').replace(/^(feature|fix|hotfix)\//, '');
    }

    private showConflictWarnings(conflicts: ConflictWarning[]) {
        const highPriorityConflicts = conflicts.filter(c => c.severity === 'high');
        const message = highPriorityConflicts.length > 0 
            ? `⚠️ ${highPriorityConflicts.length} high-priority conflicts detected!`
            : `⚠️ ${conflicts.length} potential conflicts found.`;

        vscode.window.showWarningMessage(
            message,
            'View Details',
            'Proceed Anyway',
            'Check Team Status'
        ).then(selection => {
            switch (selection) {
                case 'View Details':
                    this.showConflictDetails(conflicts);
                    break;
                case 'Proceed Anyway':
                    vscode.window.showInformationMessage('Proceeding with caution. Consider coordinating with your team.');
                    break;
                case 'Check Team Status':
                    vscode.commands.executeCommand('prism.openChat');
                    break;
            }
        });
    }

    private showConflictDetails(conflicts: ConflictWarning[]) {
        const panel = vscode.window.createWebviewPanel(
            'prismConflicts',
            'Conflict Details',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = this.generateConflictDetailsHtml(conflicts);
    }

    private generateConflictDetailsHtml(conflicts: ConflictWarning[]): string {
        const conflictItems = conflicts.map(conflict => `
            <div class="conflict-item ${conflict.severity}">
                <div class="conflict-header">
                    <span class="severity-badge ${conflict.severity}">${conflict.severity.toUpperCase()}</span>
                    <span class="conflict-type">${conflict.type.replace('-', ' ').toUpperCase()}</span>
                </div>
                <div class="conflict-message">${conflict.message}</div>
                <div class="conflict-files">
                    <strong>Affected files:</strong>
                    <ul>${conflict.files.map(file => `<li>${file}</li>`).join('')}</ul>
                </div>
                <div class="conflict-action">
                    <strong>Suggested action:</strong> ${conflict.suggestedAction}
                </div>
            </div>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Conflict Details</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        padding: 20px;
                        line-height: 1.6;
                    }
                    .conflict-item {
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 15px;
                        background-color: var(--vscode-editor-background);
                    }
                    .conflict-item.high {
                        border-left: 4px solid var(--vscode-errorForeground);
                    }
                    .conflict-item.medium {
                        border-left: 4px solid var(--vscode-notificationsWarningIcon-foreground);
                    }
                    .conflict-item.low {
                        border-left: 4px solid var(--vscode-notificationsInfoIcon-foreground);
                    }
                    .conflict-header {
                        display: flex;
                        gap: 10px;
                        margin-bottom: 10px;
                    }
                    .severity-badge {
                        background-color: var(--vscode-badge-background);
                        color: var(--vscode-badge-foreground);
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 0.8em;
                        font-weight: bold;
                    }
                    .conflict-type {
                        color: var(--vscode-descriptionForeground);
                        font-weight: 500;
                    }
                    .conflict-message {
                        margin-bottom: 10px;
                        font-weight: 500;
                    }
                    .conflict-files ul {
                        margin: 5px 0;
                        padding-left: 20px;
                    }
                    .conflict-action {
                        background-color: var(--vscode-textBlockQuote-background);
                        padding: 10px;
                        border-radius: 4px;
                        margin-top: 10px;
                    }
                </style>
            </head>
            <body>
                <h1>🚨 Conflict Analysis Results</h1>
                <p>Prism has detected potential conflicts with your current work. Review the details below:</p>
                ${conflictItems}
                <div style="margin-top: 20px; padding: 15px; background-color: var(--vscode-textBlockQuote-background); border-radius: 8px;">
                    <strong>💡 Recommendation:</strong> Consider coordinating with your team members before proceeding, or modify your approach to avoid these conflicts.
                </div>
            </body>
            </html>
        `;
    }

    public startAutoCheck() {
        const config = vscode.workspace.getConfiguration('prism');
        const interval = config.get<number>('checkInterval', 30) * 1000;

        this.checkInterval = setInterval(() => {
            this.checkCurrentWorkspace();
        }, interval);
    }

    public stopAutoCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = undefined;
        }
    }

    public dispose() {
        this.stopAutoCheck();
        this.statusBarItem.dispose();
    }
}