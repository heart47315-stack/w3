import Dexie, { type Table } from 'dexie';
import type { Task } from './storage';

class MyTaskDatabase extends Dexie {
  tasks!: Table<Task, number>;
  constructor() {
    super('mytask-week7');
    this.version(1).stores({ tasks: '++id, completed, priority, category, dueDate, createdAt, updatedAt, order' });
  }
}

export const db = new MyTaskDatabase();

export async function loadTasks() {
  const tasks = await db.tasks.toArray();
  return tasks.sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt));
}

export async function migrateLegacyTasks() {
  const flag = 'mytask-indexeddb-migrated';
  if (typeof window === 'undefined' || window.localStorage.getItem(flag)) return;
  const count = await db.tasks.count();
  if (!count) {
    const old = window.localStorage.getItem('my-task-data');
    if (old) {
      try {
        const parsed: unknown = JSON.parse(old);
        if (Array.isArray(parsed)) {
          const now = new Date().toISOString();
          await db.tasks.bulkAdd(parsed.filter((item) => item && typeof item.title === 'string').map((item, index) => ({
            title: item.title, description: '', completed: !!item.completed, priority: 'Medium' as const,
            category: 'Study', dueDate: '', createdAt: now, updatedAt: now, tags: [], reminder: '', order: index,
          })));
        }
      } catch { /* leave malformed legacy data untouched */ }
    }
  }
  window.localStorage.setItem(flag, '1');
}
