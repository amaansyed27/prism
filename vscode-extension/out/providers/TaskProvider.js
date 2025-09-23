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
exports.PrismTaskProvider = void 0;
const vscode = __importStar(require("vscode"));
class PrismTaskProvider {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.tasks = [];
        this.loadTasks();
    }
    refresh() {
        this.loadTasks();
        this._onDidChangeTreeData.fire();
    }
    async loadTasks() {
        try {
            this.tasks = await this.apiClient.getTasks();
        }
        catch (error) {
            this.tasks = [];
        }
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // Root level - return task categories
            const categories = [
                new TaskCategoryItem('My Tasks', 'assigned'),
                new TaskCategoryItem('In Progress', 'in-progress'),
                new TaskCategoryItem('Review', 'review'),
                new TaskCategoryItem('Completed', 'done')
            ];
            return Promise.resolve(categories);
        }
        else if (element instanceof TaskCategoryItem) {
            // Return tasks for this category
            const filteredTasks = this.tasks.filter(task => {
                switch (element.status) {
                    case 'assigned':
                        return task.status === 'todo';
                    case 'in-progress':
                        return task.status === 'in-progress';
                    case 'review':
                        return task.status === 'review';
                    case 'done':
                        return task.status === 'done';
                    default:
                        return false;
                }
            });
            const taskItems = filteredTasks.map(task => new TaskItem(task));
            return Promise.resolve(taskItems);
        }
        return Promise.resolve([]);
    }
}
exports.PrismTaskProvider = PrismTaskProvider;
class TaskCategoryItem extends vscode.TreeItem {
    constructor(label, status) {
        super(label, vscode.TreeItemCollapsibleState.Expanded);
        this.label = label;
        this.status = status;
        this.tooltip = `${this.label}`;
        this.contextValue = 'taskCategory';
        this.iconPath = this.getIconForCategory(status);
    }
    getIconForCategory(status) {
        switch (status) {
            case 'assigned':
                return new vscode.ThemeIcon('inbox');
            case 'in-progress':
                return new vscode.ThemeIcon('play');
            case 'review':
                return new vscode.ThemeIcon('eye');
            case 'done':
                return new vscode.ThemeIcon('check');
            default:
                return new vscode.ThemeIcon('circle');
        }
    }
}
class TaskItem extends vscode.TreeItem {
    constructor(task) {
        super(task.title, vscode.TreeItemCollapsibleState.None);
        this.task = task;
        this.tooltip = `${task.title}\n${task.description}`;
        this.description = this.getTaskDescription();
        this.contextValue = 'task';
        this.iconPath = this.getIconForPriority(task.priority);
        // Add command to open task details
        this.command = {
            command: 'prism.openTaskDetails',
            title: 'Open Task Details',
            arguments: [task]
        };
    }
    getTaskDescription() {
        const parts = [];
        if (this.task.priority !== 'medium') {
            parts.push(`${this.task.priority.toUpperCase()} priority`);
        }
        if (this.task.files && this.task.files.length > 0) {
            parts.push(`${this.task.files.length} files`);
        }
        return parts.join(' • ');
    }
    getIconForPriority(priority) {
        switch (priority) {
            case 'high':
                return new vscode.ThemeIcon('flame', new vscode.ThemeColor('errorForeground'));
            case 'medium':
                return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('notificationsWarningIcon.foreground'));
            case 'low':
                return new vscode.ThemeIcon('circle', new vscode.ThemeColor('notificationsInfoIcon.foreground'));
            default:
                return new vscode.ThemeIcon('circle');
        }
    }
}
//# sourceMappingURL=TaskProvider.js.map