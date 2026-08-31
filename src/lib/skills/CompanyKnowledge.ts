export class CompanyKnowledge {
  // In a real implementation, this would query a database or vector store
  // For the hackathon, we'll use mock data

  private roleMap: Record<string, string[]> = {
    'frontend': ['Sarah', 'Mike', 'Alex'],
    'backend': ['John', 'Priya', 'Tom'],
    'database': ['Priya', 'Tom'],
    'design': ['Lisa', 'Maria'],
    'documentation': ['Alex', 'Sarah'],
    'security': ['John'],
    'qa': ['Maria', 'Mike']
  };

  async suggestOwner(task: string): Promise<string | null> {
    const lowercaseTask = task.toLowerCase();
    
    for (const [keyword, roles] of Object.entries(this.roleMap)) {
      if (lowercaseTask.includes(keyword)) {
        // Return first role for simplicity
        return roles[0] || null;
      }
    }
    return null;
  }

  async suggestDeadline(task: string): Promise<string | null> {
    const lowercaseTask = task.toLowerCase();
    
    if (lowercaseTask.includes('urgent') || lowercaseTask.includes('critical')) {
      return 'Tomorrow';
    }
    if (lowercaseTask.includes('this week') || lowercaseTask.includes('weekly')) {
      return 'This Friday';
    }
    if (lowercaseTask.includes('monthly')) {
      return 'End of month';
    }
    if (lowercaseTask.includes('review')) {
      return 'Next week';
    }
    
    // Default: 5 business days from now
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toISOString().split('T')[0];
  }
}