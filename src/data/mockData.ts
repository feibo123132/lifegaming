import type { Task, SleepRecord, DietRecord, ExerciseRecord, VideoProject, Reward, WeeklyReport } from '../types/index.ts';

// 当前用户数据
export const currentUser = {
  name: '新玩家',
  level: 1,
  exp: 0,
  maxExp: 100,
  streak: 0,
  totalPoints: 0,
};

// 任务数据
export const initialTasks: Task[] = [];

// 睡眠记录
export const sleepRecords: SleepRecord[] = [];

// 饮食记录
export const dietRecords: DietRecord[] = [];

// 运动记录
export const exerciseRecords: ExerciseRecord[] = [];

// 视频项目
export const videoProjects: VideoProject[] = [];

// 积分商城
export const rewards: Reward[] = [];

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
export const weeklyReports: WeeklyReport[] = [];
