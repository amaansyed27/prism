import * as vscode from 'vscode';
import { ApiClient, Task } from '../services/ApiClient';

type TaskTreeItem = TaskCategoryItem | TaskItem;

export class PrismTaskProvider implements vscode.TreeDataProvider<TaskTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TaskTreeItem | undefined | null | void> = new vscode.EventEmitter<TaskTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TaskTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private tasks: Task[] = [];

    constructor(private apiClient: ApiClient) {
        this.loadTasks();
    }

    refresh(): void {
        this.loadTasks();
        this._onDidChangeTreeData.fire();
    }

    private async loadTasks(): Promise<void> {
        try {
            this.tasks = await this.apiClient.getTasks();
        } catch (error) {
            this.tasks = [];
        }
    }

    getTreeItem(element: TaskTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TaskTreeItem): Promise<TaskTreeItem[]> {
        if (!element) {
            // Root level - return task categories
            const categories: TaskCategoryItem[] = [
                new TaskCategoryItem('My Tasks', 'assigned'),
                new TaskCategoryItem('In Progress', 'in-progress'),
                new TaskCategoryItem('Review', 'review'),
                new TaskCategoryItem('Completed', 'done')
            ];
            return Promise.resolve(categories);
        } else if (element instanceof TaskCategoryItem) {
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

class TaskCategoryItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly status: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.Expanded);
        this.tooltip = `${this.label}`;
        this.contextValue = 'taskCategory';
        this.iconPath = this.getIconForCategory(status);
    }

    private getIconForCategory(status: string): vscode.ThemeIcon {
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
    constructor(public readonly task: Task) {
        super(task.title, vscode.TreeItemCollapsibleState.None);
        
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

    private getTaskDescription(): string {
        const parts = [];
        
        if (this.task.priority !== 'medium') {
            parts.push(`${this.task.priority.toUpperCase()} priority`);
        }
        
        if (this.task.files && this.task.files.length > 0) {
            parts.push(`${this.task.files.length} files`);
        }

        return parts.join(' • ');
    }

    private getIconForPriority(priority: string): vscode.ThemeIcon {
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