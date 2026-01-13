export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  password?: string; // In a real app, this would be hashed.
  isFirstLogin?: boolean;
  role?: 'admin' | 'user';
}

export interface Task {
    id: string;
    name: string;
    description?: string;
    priority?: 'Low' | 'Medium' | 'High';
    assignee: User;
    status: 'Open' | 'In Progress' | 'On Hold' | 'Done';
    startDate?: string;
    dueDate?: string;
}

export interface Project {
  id: string;
  projectId: string; // e.g., RH-28
  name: string;
  percent: number;
  owner: User;
  status: 'Active' | 'In Progress' | 'On Track' | 'Delayed' | 'In Testing';
  tasksCompleted: number;
  tasksTotal: number;
  startDate: string;
  endDate: string;
  tags?: string[];
  isTemplate?: boolean;
  tasks?: Task[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string; // Changed to string for serialization stability in localStorage
  isAi?: boolean;
}

export interface ChatSession {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: User[];
  messages: ChatMessage[];
  unread: number;
}