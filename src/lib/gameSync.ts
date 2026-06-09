import { currentUser, initialTasks, rewards } from '../data/mockData.ts';
import type { Task } from '../types/index.ts';

export interface SyncedNpcMessage {
  id: string;
  role: 'user' | 'npc';
  content: string;
  timestamp: string;
}

export interface GameData {
  tasks: Task[];
  userPoints: number;
  redeemedRewardIds: string[];
  redeemHistory: Array<{
    id: string;
    name: string;
    date: string;
    points: number;
  }>;
  npcMessages: SyncedNpcMessage[];
  npcState: 'working' | 'resting' | 'roast' | 'encourage';
  updatedAt: string;
}

export interface CloudGameState {
  userId: string;
  version: number;
  data: GameData;
  updateTime: string;
  createTime?: string;
}

export interface CloudGameStateDocument extends CloudGameState {
  _id?: string;
}

export interface NewTaskInput {
  title: string;
  category: Task['category'];
  points: number;
}

export interface EditTaskInput {
  title: string;
  points: number;
}

const normalizeTask = (task: Task): Task => ({
  ...task,
  completedAt: task.completedAt ? new Date(task.completedAt).toISOString() as unknown as Date : undefined
});

const CATEGORY_PRIORITY: Record<Task['category'], number> = {
  main: 0,
  side: 1,
  daily: 2
};

export const normalizeUserEmail = (email: string) => email.trim().toLowerCase();

export const createUserTask = (
  input: NewTaskInput,
  id: string,
  now = new Date().toISOString()
): Task | null => {
  const title = input.title.trim();
  if (!title) return null;

  const points = Math.max(1, Math.min(999, Math.round(input.points || 1)));

  return {
    id,
    title,
    category: input.category,
    points,
    completed: false,
    createdAt: now
  };
};

export const updateUserTask = (task: Task, input: EditTaskInput): Task | null => {
  const title = input.title.trim();
  if (!title) return null;

  const points = Math.max(1, Math.min(999, Math.round(input.points || 1)));

  return {
    ...task,
    title,
    points
  };
};

export const getTaskAwardedPoints = (task: Task): number =>
  task.completed ? task.completedPoints ?? task.points : 0;

export const toggleUserTaskCompletion = (
  task: Task,
  now = new Date().toISOString()
): { task: Task; pointsDelta: number } => {
  if (task.completed) {
    const pointsDelta = -getTaskAwardedPoints(task);

    return {
      task: {
        ...task,
        completed: false,
        completedAt: undefined,
        completedPoints: undefined
      },
      pointsDelta
    };
  }

  return {
    task: {
      ...task,
      completed: true,
      completedAt: now as unknown as Date,
      completedPoints: task.points
    },
    pointsDelta: task.points
  };
};

export const calculateAvailablePoints = (data: Pick<GameData, 'tasks' | 'redeemHistory'>): number => {
  const awardedPoints = data.tasks.reduce((total, task) => total + getTaskAwardedPoints(task), 0);
  const spentPoints = data.redeemHistory.reduce((total, item) => total + Math.max(0, item.points || 0), 0);

  return Math.max(0, awardedPoints - spentPoints);
};

export const reconcileGameDataPoints = (
  data: GameData,
  now = new Date().toISOString()
): GameData => {
  const userPoints = calculateAvailablePoints(data);
  if (data.userPoints === userPoints) return data;

  return {
    ...data,
    userPoints,
    updatedAt: now
  };
};

const getTaskCreatedTime = (task: Task): number => {
  const createdAt = task.createdAt ? new Date(task.createdAt).getTime() : NaN;
  if (Number.isFinite(createdAt)) return createdAt;

  const idTimestamp = /^task-(\d+)/.exec(task.id)?.[1];
  return idTimestamp ? Number(idTimestamp) : 0;
};

export const sortTasksForDisplay = (tasks: Task[]): Task[] =>
  [...tasks].sort((a, b) => {
    const categoryDelta = CATEGORY_PRIORITY[a.category] - CATEGORY_PRIORITY[b.category];
    if (categoryDelta !== 0) return categoryDelta;
    return getTaskCreatedTime(b) - getTaskCreatedTime(a);
  });

export const createInitialGameData = (now = new Date().toISOString()): GameData => ({
  tasks: initialTasks.map(normalizeTask),
  userPoints: currentUser.totalPoints,
  redeemedRewardIds: rewards.filter((reward) => reward.redeemed).map((reward) => reward.id),
  redeemHistory: [],
  npcMessages: [],
  npcState: 'working',
  updatedAt: now
});

const EXAMPLE_TASK_TITLES = new Set([
  '发布本周第一条视频',
  '完成脚本撰写',
  '保持8小时睡眠',
  '运动30分钟',
  '健康饮食三餐',
  '每日复盘',
  '阅读30分钟'
]);

export const isExampleGameData = (data: GameData | null | undefined): boolean => {
  if (!data) return false;

  const hasExampleTasks = data.tasks.some((task) => EXAMPLE_TASK_TITLES.has(task.title));
  const hasExamplePoints = data.userPoints === 1580;
  const hasExampleRedeemHistory = data.redeemHistory.some((item) =>
    ['电影之夜', '咖啡券'].includes(item.name)
  );

  return hasExampleTasks || hasExamplePoints || hasExampleRedeemHistory;
};

export const resetExampleGameData = (data: GameData): GameData =>
  isExampleGameData(data) ? createInitialGameData(data.updatedAt || new Date().toISOString()) : data;

export const mergeGameData = (local: GameData, cloud: GameData | null | undefined): GameData => {
  const cleanLocal = resetExampleGameData(local);
  const cleanCloud = cloud ? resetExampleGameData(cloud) : null;
  if (!cleanCloud) return cleanLocal;

  const localTime = new Date(cleanLocal.updatedAt || 0).getTime();
  const cloudTime = new Date(cleanCloud.updatedAt || 0).getTime();

  return reconcileGameDataPoints(cloudTime >= localTime ? cleanCloud : cleanLocal);
};

export const buildCloudGameState = (
  email: string,
  data: GameData,
  now = new Date().toISOString()
): CloudGameState => ({
  userId: normalizeUserEmail(email),
  version: 1,
  data: (() => {
    const cleanData = reconcileGameDataPoints(resetExampleGameData(data), now);
    return {
      ...cleanData,
      tasks: cleanData.tasks.map(normalizeTask),
      updatedAt: cleanData.updatedAt || now
    };
  })(),
  updateTime: now
});

const getDocumentTime = (doc: CloudGameStateDocument): number => {
  const time = doc.updateTime || doc.data?.updatedAt || doc.createTime || '';
  const parsed = new Date(time).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

export const pickLatestCloudGameDoc = (
  docs: CloudGameStateDocument[] | null | undefined
): CloudGameStateDocument | undefined => {
  if (!docs?.length) return undefined;
  return [...docs].sort((a, b) => getDocumentTime(b) - getDocumentTime(a))[0];
};

export const getCloudSyncErrorMessage = (err: unknown, fallback: string): string => {
  const message = err instanceof Error
    ? err.message
    : typeof err === 'object' && err && 'message' in err
      ? String((err as { message?: unknown }).message || '')
      : String(err || '');
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('network request error') || lowerMessage.includes('network error')) {
    return '网络请求失败，请检查 CloudBase Web 安全域名、环境 ID 和当前网络。';
  }

  return message || fallback;
};
