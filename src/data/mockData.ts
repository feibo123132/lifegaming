import type { Task, SleepRecord, DietRecord, ExerciseRecord, VideoProject, Reward, WeeklyReport } from '../types';
import { generateId } from '../utils/helpers';

// 当前用户数据
export const currentUser = {
  name: '安哥',
  level: 12,
  exp: 2850,
  maxExp: 3000,
  streak: 15,
  totalPoints: 1580,
};

// 任务数据
export const initialTasks: Task[] = [
  {
    id: generateId(),
    title: '发布本周第一条视频',
    category: 'main',
    points: 50,
    completed: false,
  },
  {
    id: generateId(),
    title: '完成脚本撰写',
    category: 'main',
    points: 30,
    completed: true,
    completedAt: new Date(),
  },
  {
    id: generateId(),
    title: '保持8小时睡眠',
    category: 'side',
    points: 20,
    completed: true,
    completedAt: new Date(),
  },
  {
    id: generateId(),
    title: '运动30分钟',
    category: 'side',
    points: 25,
    completed: false,
  },
  {
    id: generateId(),
    title: '健康饮食三餐',
    category: 'side',
    points: 15,
    completed: true,
    completedAt: new Date(),
  },
  {
    id: generateId(),
    title: '每日复盘',
    category: 'daily',
    points: 10,
    completed: true,
    completedAt: new Date(),
  },
  {
    id: generateId(),
    title: '阅读30分钟',
    category: 'daily',
    points: 10,
    completed: false,
  },
];

// 睡眠记录
export const sleepRecords: SleepRecord[] = [
  { id: generateId(), date: '2026-04-02', duration: 7.5, deepSleep: 2.1, quality: 85 },
  { id: generateId(), date: '2026-04-03', duration: 6.5, deepSleep: 1.8, quality: 70 },
  { id: generateId(), date: '2026-04-04', duration: 8.0, deepSleep: 2.5, quality: 92 },
  { id: generateId(), date: '2026-04-05', duration: 7.0, deepSleep: 2.0, quality: 78 },
  { id: generateId(), date: '2026-04-06', duration: 6.0, deepSleep: 1.5, quality: 65 },
  { id: generateId(), date: '2026-04-07', duration: 7.5, deepSleep: 2.3, quality: 88 },
  { id: generateId(), date: '2026-04-08', duration: 8.0, deepSleep: 2.4, quality: 90 },
];

// 饮食记录
export const dietRecords: DietRecord[] = [
  { id: generateId(), date: '2026-04-08', meal: 'breakfast', calories: 450, protein: 20, carbs: 55, fat: 15 },
  { id: generateId(), date: '2026-04-08', meal: 'lunch', calories: 680, protein: 35, carbs: 75, fat: 25 },
  { id: generateId(), date: '2026-04-08', meal: 'dinner', calories: 520, protein: 30, carbs: 50, fat: 18 },
];

// 运动记录
export const exerciseRecords: ExerciseRecord[] = [
  { id: generateId(), date: '2026-04-03', type: '跑步', duration: 30, calories: 280 },
  { id: generateId(), date: '2026-04-05', type: '力量训练', duration: 45, calories: 320 },
  { id: generateId(), date: '2026-04-07', type: '游泳', duration: 40, calories: 350 },
];

// 视频项目
export const videoProjects: VideoProject[] = [
  { id: generateId(), title: 'AI工具测评视频', stage: 'edit', progress: 75, deadline: '2026-04-10' },
  { id: generateId(), title: '自律方法论分享', stage: 'script', progress: 30, deadline: '2026-04-15' },
  { id: generateId(), title: '月度复盘总结', stage: 'idea', progress: 10, deadline: '2026-04-30' },
];

// 积分商城
export const rewards: Reward[] = [
  { id: generateId(), name: '火锅大餐', points: 150, icon: '🍲', redeemed: false },
  { id: generateId(), name: '电影之夜', points: 100, icon: '🎬', redeemed: true },
  { id: generateId(), name: '周末短途游', points: 500, icon: '🚗', redeemed: false },
  { id: generateId(), name: '新游戏购买', points: 300, icon: '🎮', redeemed: false },
  { id: generateId(), name: '咖啡券', points: 50, icon: '☕', redeemed: true },
  { id: generateId(), name: '按摩SPA', points: 200, icon: '💆', redeemed: false },
];

// NPC 对话
export const npcDialogues = {
  working: [
    '正在处理今天的任务数据...',
    '让我看看你的进度如何',
    '加油，今天的目标快达成了！',
  ],
  resting: [
    '休息一下也很重要~',
    '劳逸结合才能走得更远',
    '充电中，稍后再见！',
  ],
  roast: [
    '你刷短视频的速度比做视频快十倍吧？',
    '又熬夜？当日常任务的吗？',
    '这进度，是在修仙还是摆烂啊？',
  ],
  encourage: [
    '太棒了！继续保持！',
    '今天的你闪闪发光✨',
    '进步肉眼可见，加油！',
  ],
};

// 周报数据
export const weeklyReports: WeeklyReport[] = [
  { week: '第1周', totalTasks: 25, completedTasks: 18, totalPoints: 420, sleepDays: 5, exerciseDays: 3 },
  { week: '第2周', totalTasks: 28, completedTasks: 22, totalPoints: 510, sleepDays: 6, exerciseDays: 4 },
  { week: '第3周', totalTasks: 26, completedTasks: 20, totalPoints: 480, sleepDays: 4, exerciseDays: 3 },
  { week: '第4周', totalTasks: 30, completedTasks: 25, totalPoints: 580, sleepDays: 7, exerciseDays: 5 },
];
