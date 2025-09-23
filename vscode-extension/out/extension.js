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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const TaskProvider_1 = require("./providers/TaskProvider");
const TeamProvider_1 = require("./providers/TeamProvider");
const ConflictProvider_1 = require("./providers/ConflictProvider");
const WebviewProvider_1 = require("./providers/WebviewProvider");
const ConflictChecker_1 = require("./services/ConflictChecker");
const ApiClient_1 = require("./services/ApiClient");
function activate(context) {
    console.log('🎉 Prism extension is now active!');
    // Initialize services
    const apiClient = new ApiClient_1.ApiClient();
    const conflictChecker = new ConflictChecker_1.ConflictChecker(apiClient);
    // Initialize providers
    const taskProvider = new TaskProvider_1.PrismTaskProvider(apiClient);
    const teamProvider = new TeamProvider_1.PrismTeamProvider(apiClient);
    const conflictProvider = new ConflictProvider_1.PrismConflictProvider(apiClient);
    const webviewProvider = new WebviewProvider_1.PrismWebviewProvider(context, apiClient);
    // Register tree data providers
    vscode.window.createTreeView('prismTasks', { treeDataProvider: taskProvider });
    vscode.window.createTreeView('prismTeam', { treeDataProvider: teamProvider });
    vscode.window.createTreeView('prismConflicts', { treeDataProvider: conflictProvider });
    // Register webview provider
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('prism.dashboard', webviewProvider));
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
    vscode.window.showInformationMessage('🎯 Prism is ready! Start collaborating intelligently.', 'Open Dashboard', 'Start Task').then(selection => {
        if (selection === 'Open Dashboard') {
            vscode.commands.executeCommand('prism.openDashboard');
        }
        else if (selection === 'Start Task') {
            vscode.commands.executeCommand('prism.startTask');
        }
    });
}
exports.activate = activate;
function deactivate() {
    console.log('👋 Prism extension deactivated');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map