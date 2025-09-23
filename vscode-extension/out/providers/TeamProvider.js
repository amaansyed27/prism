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
exports.PrismTeamProvider = void 0;
const vscode = __importStar(require("vscode"));
class PrismTeamProvider {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.teamMembers = [];
        this.loadTeamMembers();
        // Refresh team status every 30 seconds
        if (typeof setInterval !== 'undefined') {
            setInterval(() => {
                this.refresh();
            }, 30000);
        }
    }
    refresh() {
        this.loadTeamMembers();
        this._onDidChangeTreeData.fire();
    }
    async loadTeamMembers() {
        try {
            this.teamMembers = await this.apiClient.getTeamMembers();
        }
        catch (error) {
            this.teamMembers = [];
        }
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // Root level - return team members grouped by status
            const onlineMembers = this.teamMembers.filter(member => member.status === 'online');
            const busyMembers = this.teamMembers.filter(member => member.status === 'busy');
            const offlineMembers = this.teamMembers.filter(member => member.status === 'offline');
            const items = [];
            if (onlineMembers.length > 0) {
                items.push(new TeamStatusHeader('Online', onlineMembers.length));
                items.push(...onlineMembers.map(member => new TeamMemberItem(member)));
            }
            if (busyMembers.length > 0) {
                items.push(new TeamStatusHeader('Busy', busyMembers.length));
                items.push(...busyMembers.map(member => new TeamMemberItem(member)));
            }
            if (offlineMembers.length > 0) {
                items.push(new TeamStatusHeader('Offline', offlineMembers.length));
                items.push(...offlineMembers.map(member => new TeamMemberItem(member)));
            }
            return Promise.resolve(items);
        }
        return Promise.resolve([]);
    }
}
exports.PrismTeamProvider = PrismTeamProvider;
class TeamStatusHeader extends vscode.TreeItem {
    constructor(status, count) {
        super(`${status} (${count})`, vscode.TreeItemCollapsibleState.None);
        this.status = status;
        this.count = count;
        this.contextValue = 'teamStatusHeader';
        this.iconPath = this.getIconForStatus(status);
    }
    getIconForStatus(status) {
        switch (status.toLowerCase()) {
            case 'online':
                return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.green'));
            case 'busy':
                return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.yellow'));
            case 'offline':
                return new vscode.ThemeIcon('circle', new vscode.ThemeColor('disabledForeground'));
            default:
                return new vscode.ThemeIcon('circle');
        }
    }
}
class TeamMemberItem extends vscode.TreeItem {
    constructor(member) {
        super(member.name, vscode.TreeItemCollapsibleState.None);
        this.member = member;
        this.description = this.getMemberDescription();
        this.tooltip = this.getMemberTooltip();
        this.contextValue = 'teamMember';
        this.iconPath = this.getIconForStatus(member.status);
        // Add command to start chat with team member
        this.command = {
            command: 'prism.chatWithMember',
            title: 'Chat with Team Member',
            arguments: [member]
        };
    }
    getMemberDescription() {
        const parts = [];
        if (this.member.currentTask) {
            parts.push(`Working on: ${this.member.currentTask}`);
        }
        else if (this.member.status === 'online') {
            parts.push('Available');
        }
        else if (this.member.status === 'busy') {
            parts.push('Busy');
        }
        else {
            parts.push('Offline');
        }
        return parts.join(' • ');
    }
    getMemberTooltip() {
        let tooltip = `${this.member.name} (${this.member.email})\nStatus: ${this.member.status}`;
        if (this.member.currentTask) {
            tooltip += `\nCurrent task: ${this.member.currentTask}`;
        }
        return tooltip;
    }
    getIconForStatus(status) {
        switch (status) {
            case 'online':
                return new vscode.ThemeIcon('account', new vscode.ThemeColor('charts.green'));
            case 'busy':
                return new vscode.ThemeIcon('account', new vscode.ThemeColor('charts.yellow'));
            case 'offline':
                return new vscode.ThemeIcon('account', new vscode.ThemeColor('disabledForeground'));
            default:
                return new vscode.ThemeIcon('account');
        }
    }
}
//# sourceMappingURL=TeamProvider.js.map