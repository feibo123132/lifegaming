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

const normalizeTask = (task: Task): Task => ({
  ...task,
  completedAt: task.completedAt ? new Date(task.completedAt).toISOString() as unknown as Date : undefined
});

export const normalizeUserEmail = (email: string) => email.trim().toLowerCase();

export const createInitialGameData = (now = new Date().toISOString()): GameData => ({
  tasks: initialTasks.map(normalizeTask),
  userPoints: currentUser.totalPoints,
  redeemedRewardIds: rewards.filter((reward) => reward.redeemed).map((reward) => reward.id),
  redeemHistory: [
    { id: 'movie-night-2026-04-01', name: '电影之夜', date: '2026-04-01', points: 100 },
    { id: 'coffee-2026-03-28', name: '咖啡券', date: '2026-03-28', points: 50 }
  ],
  npcMessages: [
    {
      id: 'welcome',
      role: 'npc',
      content: '早安！今天的任务已经准备好了，准备好了吗？🦞',
      timestamp: now
    }
  ],
  npcState: 'working',
  updatedAt: now
});

export const mergeGameData = (local: GameData, cloud: GameData | null | undefined): GameData => {
  if (!cloud) return local;

  const localTime = new Date(local.updatedAt || 0).getTime();
  const cloudTime = new Date(cloud.updatedAt || 0).getTime();

  return cloudTime >= localTime ? cloud : local;
};

export const buildCloudGameState = (
  email: string,
  data: GameData,
  now = new Date().toISOString()
): CloudGameState => ({
  userId: normalizeUserEmail(email),
  version: 1,
  data: {
    ...data,
    tasks: data.tasks.map(normalizeTask),
    updatedAt: data.updatedAt || now
  },
  updateTime: now
});
