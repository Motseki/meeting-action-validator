export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee?: string;
}

export class PMToolIntegration {
  // Mock database of existing tasks
  private existingTasks: Task[] = [
    { id: 'TASK-123', title: 'Update API documentation', status: 'todo', assignee: 'Sarah' },
    { id: 'TASK-456', title: 'Fix login page bug', status: 'in-progress', assignee: 'Mike' },
    { id: 'TASK-789', title: 'Design new dashboard', status: 'todo', assignee: 'Lisa' },
  ];

  async findSimilarTasks(taskTitle: string): Promise<Task[]> {
    const lowercaseTitle = taskTitle.toLowerCase();
    const keywords = lowercaseTitle.split(' ');
    
    return this.existingTasks.filter(task => {
      const lowercaseTask = task.title.toLowerCase();
      return keywords.some(keyword => 
        lowercaseTask.includes(keyword) && keyword.length > 3
      );
    });
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const newTask: Task = {
      id: `TASK-${Math.floor(Math.random() * 1000)}`,
      ...task
    };
    this.existingTasks.push(newTask);
    return newTask;
  }
}