import * as vscode from 'vscode';
import { PrismTaskProvider } from './providers/TaskProvider';
import { PrismTeamProvider } from './providers/TeamProvider';
import { PrismConflictProvider } from './providers/ConflictProvider';
import { PrismWebviewProvider } from './providers/WebviewProvider';
import { ConflictChecker } from './services/ConflictChecker';
import { ApiClient } from './services/ApiClient';

export function activate(context: vscode.ExtensionContext) {
    console.log('🎉 Prism extension is now active!');

    // Initialize services
    const apiClient = new ApiClient();
    const conflictChecker = new ConflictChecker(apiClient);

    // Initialize providers
    const taskProvider = new PrismTaskProvider(apiClient);
    const teamProvider = new PrismTeamProvider(apiClient);
    const conflictProvider = new PrismConflictProvider(apiClient);
    const webviewProvider = new PrismWebviewProvider(context, apiClient);

    // Register tree data providers
    vscode.window.createTreeView('prismTasks', { treeDataProvider: taskProvider });
    vscode.window.createTreeView('prismTeam', { treeDataProvider: teamProvider });
    vscode.window.createTreeView('prismConflicts', { treeDataProvider: conflictProvider });

    // Register webview provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('prism.dashboard', webviewProvider)
    );

    // Register commands
    const commands = [
        vscode.commands.registerCommand('prism.openDashboard', () => {
            webviewProvider.openDashboard();
        }),

        vscode.commands.registerCommand('prism.startTask', async () => {
            await webviewProvider.showStartTaskPanel();
        }),

        vscode.commands.registerCommand('prism.checkConflicts', async () => {
            await conflictChecker.checkCurrentWorkspace();
        }),

        vscode.commands.registerCommand('prism.openChat', () => {
            webviewProvider.openChat();
        }),

        vscode.commands.registerCommand('prism.showTasks', () => {
            vscode.commands.executeCommand('prismTasks.focus');
        }),

        vscode.commands.registerCommand('prism.refreshTasks', () => {
            taskProvider.refresh();
        }),

        vscode.commands.registerCommand('prism.refreshTeam', () => {
            teamProvider.refresh();
        }),

        vscode.commands.registerCommand('prism.refreshConflicts', () => {
            conflictProvider.refresh();
        })
    ];

    context.subscriptions.push(...commands);

    // Start conflict checking if enabled
    const config = vscode.workspace.getConfiguration('prism');
    if (config.get('enableConflictChecking')) {
        conflictChecker.startAutoCheck();
    }

    // Show welcome message
    vscode.window.showInformationMessage(
        '🎯 Prism is ready! Start collaborating intelligently.',
        'Open Dashboard',
        'Start Task'
    ).then(selection => {
        if (selection === 'Open Dashboard') {
            vscode.commands.executeCommand('prism.openDashboard');
        } else if (selection === 'Start Task') {
            vscode.commands.executeCommand('prism.startTask');
        }
    });
}

export function deactivate() {
    console.log('👋 Prism extension deactivated');
}