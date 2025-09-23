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
exports.PrismConflictProvider = void 0;
const vscode = __importStar(require("vscode"));
class PrismConflictProvider {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.conflicts = [];
        this.loadConflicts();
    }
    refresh() {
        this.loadConflicts();
        this._onDidChangeTreeData.fire();
    }
    async loadConflicts() {
        try {
            // This would typically be called after a conflict check
            // For now, we'll show an empty state until conflicts are detected
            this.conflicts = [];
        }
        catch (error) {
            this.conflicts = [];
        }
    }
    updateConflicts(conflicts) {
        this.conflicts = conflicts;
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            if (this.conflicts.length === 0) {
                return Promise.resolve([new NoConflictsItem()]);
            }
            // Group conflicts by severity
            const highConflicts = this.conflicts.filter(c => c.severity === 'high');
            const mediumConflicts = this.conflicts.filter(c => c.severity === 'medium');
            const lowConflicts = this.conflicts.filter(c => c.severity === 'low');
            const items = [];
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
exports.PrismConflictProvider = PrismConflictProvider;
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
    constructor(label, count, severity) {
        super(`${label} (${count})`, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.count = count;
        this.severity = severity;
        this.contextValue = 'conflictCategory';
        this.iconPath = this.getIconForSeverity(severity);
    }
    getIconForSeverity(severity) {
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
    constructor(conflict) {
        super(conflict.message, vscode.TreeItemCollapsibleState.None);
        this.conflict = conflict;
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
    getConflictDescription() {
        const parts = [this.conflict.type.replace('-', ' ').toUpperCase()];
        if (this.conflict.files.length > 0) {
            parts.push(`${this.conflict.files.length} files affected`);
        }
        return parts.join(' • ');
    }
    getConflictTooltip() {
        let tooltip = `${this.conflict.message}\n\nType: ${this.conflict.type}\nSeverity: ${this.conflict.severity}`;
        if (this.conflict.files.length > 0) {
            tooltip += `\n\nAffected files:\n${this.conflict.files.join('\n')}`;
        }
        if (this.conflict.suggestedAction) {
            tooltip += `\n\nSuggested action: ${this.conflict.suggestedAction}`;
        }
        return tooltip;
    }
    getIconForType(type) {
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
//# sourceMappingURL=ConflictProvider.js.map