import * as vscode from 'vscode';
import { ApiClient, TeamMember } from '../services/ApiClient';

type TeamTreeItem = TeamStatusHeader | TeamMemberItem;

export class PrismTeamProvider implements vscode.TreeDataProvider<TeamTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TeamTreeItem | undefined | null | void> = new vscode.EventEmitter<TeamTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TeamTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private teamMembers: TeamMember[] = [];

    constructor(private apiClient: ApiClient) {
        this.loadTeamMembers();
        // Refresh team status every 30 seconds
        if (typeof setInterval !== 'undefined') {
            setInterval(() => {
                this.refresh();
            }, 30000);
        }
    }

    refresh(): void {
        this.loadTeamMembers();
        this._onDidChangeTreeData.fire();
    }

    private async loadTeamMembers(): Promise<void> {
        try {
            this.teamMembers = await this.apiClient.getTeamMembers();
        } catch (error) {
            this.teamMembers = [];
        }
    }

    getTreeItem(element: TeamTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TeamTreeItem): Promise<TeamTreeItem[]> {
        if (!element) {
            // Root level - return team members grouped by status
            const onlineMembers = this.teamMembers.filter(member => member.status === 'online');
            const busyMembers = this.teamMembers.filter(member => member.status === 'busy');
            const offlineMembers = this.teamMembers.filter(member => member.status === 'offline');

            const items: TeamTreeItem[] = [];
            
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

class TeamStatusHeader extends vscode.TreeItem {
    constructor(
        public readonly status: string,
        public readonly count: number
    ) {
        super(`${status} (${count})`, vscode.TreeItemCollapsibleState.None);
        this.contextValue = 'teamStatusHeader';
        this.iconPath = this.getIconForStatus(status);
    }

    private getIconForStatus(status: string): vscode.ThemeIcon {
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
    constructor(public readonly member: TeamMember) {
        super(member.name, vscode.TreeItemCollapsibleState.None);
        
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

    private getMemberDescription(): string {
        const parts = [];
        
        if (this.member.currentTask) {
            parts.push(`Working on: ${this.member.currentTask}`);
        } else if (this.member.status === 'online') {
            parts.push('Available');
        } else if (this.member.status === 'busy') {
            parts.push('Busy');
        } else {
            parts.push('Offline');
        }

        return parts.join(' • ');
    }

    private getMemberTooltip(): string {
        let tooltip = `${this.member.name} (${this.member.email})\nStatus: ${this.member.status}`;
        
        if (this.member.currentTask) {
            tooltip += `\nCurrent task: ${this.member.currentTask}`;
        }
        
        return tooltip;
    }

    private getIconForStatus(status: string): vscode.ThemeIcon {
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