export type AppSettings = {
  theme: 'light' | 'dark' | 'system';
  defaultPriority: Priority;
  defaultCategory: string;
  dailyGoal: number;
  focusMinutes: number;
  breakMinutes: number;
  animations: boolean;
  onboardingComplete: boolean;
};

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type Task = {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags: string[];
  reminder: string;
  order: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light', defaultPriority: 'Medium', defaultCategory: 'Study',
  dailyGoal: 5, focusMinutes: 25, breakMinutes: 5, animations: true, onboardingComplete: false,
};

export function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : (JSON.parse(value) as T);
  } catch { return fallback; }
}

export function setStored<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be unavailable */ }
  }
}

export function removeStored(key: string) {
  if (typeof window !== 'undefined') window.localStorage.removeItem(key);
}

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Partial<Task>;
  return typeof task.title === 'string' && task.title.trim().length > 0 &&
    typeof task.completed === 'boolean';
}
