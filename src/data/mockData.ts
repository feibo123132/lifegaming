import type { Task, SleepRecord, DietRecord, ExerciseRecord, VideoProject, Reward, RewardCategory, WeeklyReport } from '../types/index.ts';

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
export const rewardCategories: RewardCategory[] = [
  {
    id: 'delight',
    title: '小确幸补给',
    description: '把努力换成今天就能摸到的甜。',
    icon: '🍬',
    colorClassName: 'bg-pop-yellow'
  },
  {
    id: 'recovery',
    title: '回血仪式',
    description: '允许自己停一停，把电量慢慢充回来。',
    icon: '🌙',
    colorClassName: 'bg-pop-green'
  },
  {
    id: 'escape',
    title: '灵感出逃',
    description: '离开惯性轨道，去收集一点新鲜感。',
    icon: '🎈',
    colorClassName: 'bg-pop-blue'
  },
  {
    id: 'investment',
    title: '未来投资',
    description: '给未来的自己存一份漂亮的底气。',
    icon: '💎',
    colorClassName: 'bg-pop-purple'
  }
];

export const rewards: Reward[] = [
  {
    id: 'milk-tea',
    name: '一杯奶茶',
    points: 80,
    icon: '🧋',
    category: 'delight',
    redeemed: false,
  },
  {
    id: 'dessert-window',
    name: '橱窗甜点',
    points: 90,
    icon: '🍰',
    category: 'delight',
    redeemed: false,
  },
  {
    id: 'fresh-flowers',
    name: '给自己买花',
    points: 120,
    icon: '💐',
    category: 'delight',
    redeemed: false,
  },
  {
    id: 'favorite-meal',
    name: '奖励餐',
    points: 220,
    icon: '🍱',
    category: 'delight',
    redeemed: false,
  },
  {
    id: 'movie-night',
    name: '电影之夜',
    points: 150,
    icon: '🎬',
    category: 'escape',
    redeemed: false,
  },
  {
    id: 'game-hour',
    name: '游戏一小时',
    points: 120,
    icon: '🎮',
    category: 'escape',
    redeemed: false,
  },
  {
    id: 'bookstore-wander',
    name: '书店漫游',
    points: 180,
    icon: '📚',
    category: 'escape',
    redeemed: false,
  },
  {
    id: 'city-walk',
    name: '城市散步',
    points: 200,
    icon: '🚶',
    category: 'escape',
    redeemed: false,
  },
  {
    id: 'lazy-afternoon',
    name: '放空半日',
    points: 300,
    icon: '🛋️',
    category: 'recovery',
    redeemed: false,
  },
  {
    id: 'guilt-free-nap',
    name: '无负罪午睡',
    points: 110,
    icon: '😴',
    category: 'recovery',
    redeemed: false,
  },
  {
    id: 'early-sleep-pass',
    name: '早睡通行证',
    points: 160,
    icon: '🛌',
    category: 'recovery',
    redeemed: false,
  },
  {
    id: 'bath-ritual',
    name: '香薰泡澡',
    points: 240,
    icon: '🛁',
    category: 'recovery',
    redeemed: false,
  },
  {
    id: 'new-gear',
    name: '小装备基金',
    points: 500,
    icon: '🎧',
    category: 'investment',
    redeemed: false,
  },
  {
    id: 'course-fund',
    name: '课程基金',
    points: 420,
    icon: '🎓',
    category: 'investment',
    redeemed: false,
  },
  {
    id: 'skincare-upgrade',
    name: '护肤升级',
    points: 360,
    icon: '🧴',
    category: 'investment',
    redeemed: false,
  },
  {
    id: 'health-check',
    name: '体检基金',
    points: 650,
    icon: '🩺',
    category: 'investment',
    redeemed: false,
  },
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
export const weeklyReports: WeeklyReport[] = [];
