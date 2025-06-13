// lib/taskStore.ts

type TaskStatus = "pending" | "running" | "completed" | "error"

interface TaskInfo {
  status: TaskStatus
  count?: number
  message?: string
  failedIds?: string[]
}

// Use globalThis to prevent re-initialization during dev HMR or API cold starts
const globalTasks = globalThis as any

if (!globalTasks._taskStore) {
  globalTasks._taskStore = {} as Record<string, TaskInfo>
}

const tasks: Record<string, TaskInfo> = globalTasks._taskStore

export function createTask(taskId: string) {
  tasks[taskId] = { status: "pending" }
}

export function updateTask(taskId: string, info: Partial<TaskInfo>) {
  if (tasks[taskId]) {
    tasks[taskId] = { ...tasks[taskId], ...info }
  }
}

export function getTask(taskId: string): TaskInfo {
  return tasks[taskId] ?? { status: "unknown" }
}
