import * as vscode from 'vscode';
import { ApiClient, ConflictWarning } from '../services/ApiClient';

type ConflictTreeItem = NoConflictsItem | ConflictCategoryItem | ConflictItem;

export class PrismConflictProvider implements vscode.TreeDataProvider<ConflictTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ConflictTreeItem | undefined | null | void> = new vscode.EventEmitter<ConflictTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ConflictTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private conflicts: ConflictWarning[] = [];

    constructor(private apiClient: ApiClient) {
        this.loadConflicts();
    }

    refresh(): void {
        this.loadConflicts();
        this._onDidChangeTreeData.fire();
    }

    private async loadConflicts(): Promise<void> {
        try {
            // This would typically be called after a conflict check
            // For now, we'll show an empty state until conflicts are detected
            this.conflicts = [];
        } catch (error) {
            this.conflicts = [];
        }
    }

    updateConflicts(conflicts: ConflictWarning[]): void {
        this.conflicts = conflicts;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ConflictTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ConflictTreeItem): Promise<ConflictTreeItem[]> {
        if (!element) {
            if (this.conflicts.length === 0) {
                return Promise.resolve([new NoConflictsItem()]);
            }

            // Group conflicts by severity
            const highConflicts = this.conflicts.filter(c => c.severity === 'high');
            const mediumConflicts = this.conflicts.filter(c => c.severity === 'medium');
            const lowConflicts = this.conflicts.filter(c => c.severity === 'low');

            const items: ConflictTreeItem[] = [];

            if (highConflicts.length > 0) {
                items.push(new ConflictCategoryItem('High Priority', highConflicts.length, 'high'));
                items.push(...highConflicts.map(conflict => new ConflictItem(conflict)));
            }

            if (mediumConflicts.length > 0) {
                items.push(new ConflictCategoryItem('Medium Priority', mediumConflicts.length, 'medium'));
                items.push(...mediumConflicts.map(conflict => new ConflictItem(conflict)));
            }

            if (lowConflicts.length > 0) {
                items.push(new ConflictCategoryItem('Low Priority', lowConflicts.length, 'low'));
                items.push(...lowConflicts.map(conflict => new ConflictItem(conflict)));
            }

            return Promise.resolve(items);
        }

        return Promise.resolve([]);
    }
}

class NoConflictsItem extends vscode.TreeItem {
    constructor() {
        super('✅ No conflicts detected', vscode.TreeItemCollapsibleState.None);
        this.description = 'Safe to proceed';
        this.tooltip = 'No potential conflicts found with your current work';
        this.contextValue = 'noConflicts';
        this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
    }
}

class ConflictCategoryItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly count: number,
        public readonly severity: string
    ) {
        super(`${label} (${count})`, vscode.TreeItemCollapsibleState.None);
        this.contextValue = 'conflictCategory';
        this.iconPath = this.getIconForSeverity(severity);
    }

    private getIconForSeverity(severity: string): vscode.ThemeIcon {
        switch (severity) {
            case 'high':
                return new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
            case 'medium':
                return new vscode.ThemeIcon('warning', new vscode.ThemeColor('notificationsWarningIcon.foreground'));
            case 'low':
                return new vscode.ThemeIcon('info', new vscode.ThemeColor('notificationsInfoIcon.foreground'));
            default:
                return new vscode.ThemeIcon('circle');
        }
    }
}

class ConflictItem extends vscode.TreeItem {
    constructor(public readonly conflict: ConflictWarning) {
        super(conflict.message, vscode.TreeItemCollapsibleState.None);
        
        this.description = this.getConflictDescription();
        this.tooltip = this.getConflictTooltip();
        this.contextValue = 'conflict';
        this.iconPath = this.getIconForType(conflict.type);
        
        // Add command to view conflict details
        this.command = {
            command: 'prism.viewConflictDetails',
            title: 'View Conflict Details',
            arguments: [conflict]
        };
    }

    private getConflictDescription(): string {
        const parts = [this.conflict.type.replace('-', ' ').toUpperCase()];
        
        if (this.conflict.files.length > 0) {
            parts.push(`${this.conflict.files.length} files affected`);
        }

        return parts.join(' • ');
    }

    private getConflictTooltip(): string {
        let tooltip = `${this.conflict.message}\n\nType: ${this.conflict.type}\nSeverity: ${this.conflict.severity}`;
        
        if (this.conflict.files.length > 0) {
            tooltip += `\n\nAffected files:\n${this.conflict.files.join('\n')}`;
        }
        
        if (this.conflict.suggestedAction) {
            tooltip += `\n\nSuggested action: ${this.conflict.suggestedAction}`;
        }
        
        return tooltip;
    }

    private getIconForType(type: string): vscode.ThemeIcon {
        switch (type) {
            case 'file-conflict':
                return new vscode.ThemeIcon('file-code', new vscode.ThemeColor('errorForeground'));
            case 'dependency-conflict':
                return new vscode.ThemeIcon('package', new vscode.ThemeColor('notificationsWarningIcon.foreground'));
            case 'merge-conflict':
                return new vscode.ThemeIcon('git-merge', new vscode.ThemeColor('errorForeground'));
            default:
                return new vscode.ThemeIcon('warning');
        }
    }
}