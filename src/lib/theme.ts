export type ThemeMode = 'pop' | 'cultivation';

export const DEFAULT_THEME_MODE: ThemeMode = 'pop';
export const THEME_MODE_STORAGE_KEY = 'lifegaming-theme-mode';

export const normalizeThemeMode = (value: unknown): ThemeMode =>
  value === 'cultivation' || value === 'pop' ? value : DEFAULT_THEME_MODE;

export const getNextThemeMode = (mode: ThemeMode): ThemeMode =>
  mode === 'pop' ? 'cultivation' : 'pop';

export const getThemeModeClassName = (mode: ThemeMode): string =>
  mode === 'cultivation' ? 'theme-cultivation' : 'theme-pop';

export const getThemeModeLabel = (mode: ThemeMode): string =>
  mode === 'cultivation' ? '国风' : 'POP';

const POP_THEME_COPY = {
  navDashboard: '首页',
  navTasks: '任务',
  navShop: '元宝商城',
  navData: '数据记录',
  navReview: '复盘中心',
  points: '元宝',
  availablePoints: '可用元宝',
  experience: '经验值',
  currentLevel: '当前等级',
  nextLevelRemaining: '距离下一级还需',
  streak: '修道问心',
  todayTasks: '今日任务',
  weeklyRank: '本周排名',
  todayProgress: '今日进度',
  taskTitle: '任务',
  taskName: '任务名称',
  taskPlaceholder: '今天要完成什么？',
  addTask: '添加',
  dailyAuto: '每天自动出现',
  rewardOnly: '只奖不罚',
  graceOneDay: '宽限1天',
  gracedOnce: '已宽限一次',
  cycleChallenge: '周期挑战',
  consecutiveDays: '连续天数',
  mainTask: '主线任务',
  sideTask: '支线任务',
  dailyTask: '日常任务',
  mainCategory: '主线',
  sideCategory: '支线',
  dailyCategory: '日常',
  shopTitle: '元宝商城',
  shopSubtitle: '完成任务赚取元宝，兑换专属奖励',
  redeemSuccess: '成功兑换',
  redeemed: '已兑换',
  redeemNow: '立即兑换',
  pointsInsufficient: '元宝不足',
  redeemHistory: '兑换记录',
  noRedeemHistory: '暂无兑换记录',
  pointsMaster: '元宝达人',
  pointsAnimation: '元宝GET！',
  dataTitle: '数据记录',
  reviewTitle: '复盘中心'
} as const;

export type ThemeCopy = {
  [Key in keyof typeof POP_THEME_COPY]: string;
};

const CULTIVATION_THEME_COPY: ThemeCopy = {
  navDashboard: '洞府',
  navTasks: '修行',
  navShop: '万象阁',
  navData: '起居录',
  navReview: '省身录',
  points: '灵石',
  availablePoints: '可用灵石',
  experience: '修为',
  currentLevel: '当前境界',
  nextLevelRemaining: '距离突破还需',
  streak: '修道问心',
  todayTasks: '今日修行',
  weeklyRank: '本周榜位',
  todayProgress: '今日进境',
  taskTitle: '修行',
  taskName: '修行事项',
  taskPlaceholder: '今日欲成何事？',
  addTask: '记入',
  dailyAuto: '每日修习',
  rewardOnly: '有赏无罚',
  graceOneDay: '缓期一日',
  gracedOnce: '已缓期一次',
  cycleChallenge: '连续历练',
  consecutiveDays: '历练天数',
  mainTask: '主修',
  sideTask: '辅修',
  dailyTask: '日课',
  mainCategory: '主修',
  sideCategory: '辅修',
  dailyCategory: '日课',
  shopTitle: '万象阁',
  shopSubtitle: '完成修行积攒灵石，换取心仪之物',
  redeemSuccess: '如愿所得',
  redeemed: '已收入囊中',
  redeemNow: '收入囊中',
  pointsInsufficient: '灵石不足',
  redeemHistory: '灵石账簿',
  noRedeemHistory: '账簿尚空',
  pointsMaster: '聚宝有方',
  pointsAnimation: '灵石入账！',
  dataTitle: '起居录',
  reviewTitle: '省身录'
};

export const getThemeCopy = (mode: ThemeMode): ThemeCopy =>
  mode === 'cultivation' ? CULTIVATION_THEME_COPY : POP_THEME_COPY;
