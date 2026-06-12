import { currentUser, initialTasks, rewards } from '../data/mockData.ts';
import type { DailyTaskTemplate, Task, ViewMode } from '../types/index.ts';

export interface SyncedNpcMessage {
  id: string;
  role: 'user' | 'npc';
  content: string;
  timestamp: string;
}

export interface GameData {
  profileName: string;
  tasks: Task[];
  dailyTemplates: DailyTaskTemplate[];
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
  dateKey?: string;
  saveAsDailyTemplate?: boolean;
  templateId?: string;
}

export interface EditTaskInput {
  title: string;
  points: number;
}

export interface PlayerProgress {
  totalExp: number;
  level: number;
  exp: number;
  maxExp: number;
  expToNextLevel: number;
  levelTitle: string;
  streak: number;
}

export interface TaskCompletionStats {
  completed: number;
  total: number;
  completionRate: number;
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

const DEFAULT_TASK_POINTS: Record<Task['category'], number> = {
  main: 20,
  side: 15,
  daily: 10
};

export const getDefaultTaskPoints = (category: Task['category']): number => DEFAULT_TASK_POINTS[category];

const CULTIVATION_REALMS = [
  '炼气期',
  '筑基期',
  '结丹期',
  '元婴期',
  '化神期',
  '炼虚期',
  '合体期',
  '大乘期',
  '渡劫期',
  '飞升期',
  '真仙境'
];

export const getLevelExpRequirement = (level: number): number => {
  const normalizedLevel = Math.max(1, Math.floor(level));
  return 90 + normalizedLevel * 10;
};

export const getLevelTitle = (level: number): string => {
  const normalizedLevel = Math.max(1, Math.floor(level));
  const realmIndex = Math.min(
    Math.floor((normalizedLevel - 1) / 10),
    CULTIVATION_REALMS.length - 1
  );
  const levelInRealm = ((normalizedLevel - 1) % 10) + 1;
  const minorStage = levelInRealm <= 3
    ? '初期'
    : levelInRealm <= 6
      ? '中期'
      : levelInRealm <= 9
        ? '后期'
        : '大圆满';

  return `${CULTIVATION_REALMS[realmIndex]}${minorStage}`;
};

export const normalizeUserEmail = (email: string) => email.trim().toLowerCase();

export const shouldUseLocalGameDataForSync = (
  localEmail: string | null | undefined,
  syncEmail: string
): boolean => !localEmail || normalizeUserEmail(localEmail) === normalizeUserEmail(syncEmail);

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const padDatePart = (value: number): string => String(value).padStart(2, '0');

export const getLocalDateKey = (value: Date | string = new Date()): string => {
  if (typeof value === 'string' && DATE_KEY_PATTERN.test(value.slice(0, 10))) {
    return value.slice(0, 10);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return getLocalDateKey(new Date());
  }

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate())
  ].join('-');
};

export const createTaskTimestampForDate = (
  dateKey: string,
  timeSource: Date | string = new Date()
): string => {
  const normalizedDateKey = DATE_KEY_PATTERN.test(dateKey) ? dateKey : getLocalDateKey(timeSource);
  const sourceText = timeSource instanceof Date ? timeSource.toISOString() : timeSource;
  const timeMatch = /T(\d{2}:\d{2}:\d{2}(?:\.\d{3})?)/.exec(sourceText);
  const time = timeMatch?.[1] ?? '12:00:00.000';

  return `${normalizedDateKey}T${time}`;
};

export const shiftDateKey = (dateKey: string, dayDelta: number): string => {
  const normalizedDateKey = DATE_KEY_PATTERN.test(dateKey) ? dateKey : getLocalDateKey();
  const date = new Date(`${normalizedDateKey}T00:00:00`);
  date.setDate(date.getDate() + dayDelta);
  return getLocalDateKey(date);
};

const getWeekDateKeys = (dateKey: string): string[] => {
  const date = new Date(`${DATE_KEY_PATTERN.test(dateKey) ? dateKey : getLocalDateKey()}T00:00:00`);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);

  return Array.from({ length: 7 }, (_, index) => {
    const dayInWeek = new Date(date);
    dayInWeek.setDate(date.getDate() + index);
    return getLocalDateKey(dayInWeek);
  });
};

const getMonthDateKeys = (dateKey: string): string[] => {
  const date = new Date(`${DATE_KEY_PATTERN.test(dateKey) ? dateKey : getLocalDateKey()}T00:00:00`);
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => getLocalDateKey(new Date(year, month, index + 1)));
};

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
    createdAt: input.dateKey ? createTaskTimestampForDate(input.dateKey, now) : now,
    ...(input.category === 'daily' && input.templateId ? { templateId: input.templateId } : {})
  };
};

export const createDailyTemplate = (
  input: Pick<NewTaskInput, 'title' | 'points'>,
  id: string,
  now = new Date().toISOString()
): DailyTaskTemplate | null => {
  const title = input.title.trim();
  if (!title) return null;

  return {
    id,
    title,
    points: Math.max(1, Math.min(999, Math.round(input.points || 1))),
    active: true,
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

const getTaskDateKey = (task: Task): string =>
  getLocalDateKey(task.createdAt || new Date(getTaskCreatedTime(task)));

export const isOverdueIncompleteTask = (
  task: Task,
  today: Date | string = new Date()
): boolean => !task.completed && getTaskDateKey(task) < getLocalDateKey(today);

export const getTaskPenaltyPoints = (
  task: Task,
  today: Date | string = new Date()
): number => {
  if (!isOverdueIncompleteTask(task, today)) return 0;
  return Math.max(0, Math.round(task.points || 0)) * 3;
};

const getOverdueTaskPenaltyPoints = (
  tasks: Task[],
  today: Date | string = new Date()
): number => tasks.reduce((total, task) => total + getTaskPenaltyPoints(task, today), 0);

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

export const calculateAvailablePoints = (
  data: Pick<GameData, 'tasks' | 'redeemHistory'>,
  today: Date | string = new Date()
): number => {
  const awardedPoints = data.tasks.reduce((total, task) => total + getTaskAwardedPoints(task), 0);
  const spentPoints = data.redeemHistory.reduce((total, item) => total + Math.max(0, item.points || 0), 0);
  const penaltyPoints = getOverdueTaskPenaltyPoints(data.tasks, today);

  return Math.max(0, awardedPoints - spentPoints - penaltyPoints);
};

const getTaskCompletionDateKey = (task: Task): string | null => {
  if (!task.completed) return null;
  return getLocalDateKey(task.completedAt || task.createdAt || new Date(getTaskCreatedTime(task)));
};

export const getPlayerProgress = (
  tasks: Task[],
  today: Date | string = new Date()
): PlayerProgress => {
  const awardedExp = tasks.reduce((total, task) => total + getTaskAwardedPoints(task), 0);
  const totalExp = Math.max(0, awardedExp - getOverdueTaskPenaltyPoints(tasks, today));
  let level = 1;
  let exp = totalExp;
  let maxExp = getLevelExpRequirement(level);

  while (exp >= maxExp) {
    exp -= maxExp;
    level += 1;
    maxExp = getLevelExpRequirement(level);
  }

  const expToNextLevel = maxExp - exp;
  const levelTitle = getLevelTitle(level);
  const completedDateKeys = new Set(
    tasks
      .map(getTaskCompletionDateKey)
      .filter((dateKey): dateKey is string => Boolean(dateKey))
  );

  let cursor = getLocalDateKey(today);
  if (!completedDateKeys.has(cursor)) {
    const yesterday = shiftDateKey(cursor, -1);
    if (!completedDateKeys.has(yesterday)) {
      return {
        totalExp,
        level,
        exp,
        maxExp,
        expToNextLevel,
        levelTitle,
        streak: 0
      };
    }
    cursor = yesterday;
  }

  let streak = 0;
  while (completedDateKeys.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  return {
    totalExp,
    level,
    exp,
    maxExp,
    expToNextLevel,
    levelTitle,
    streak
  };
};

export const reconcileGameDataPoints = (
  data: GameData,
  now = new Date().toISOString()
): GameData => {
  const userPoints = calculateAvailablePoints(data, now);
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

export const filterTasksByDate = (tasks: Task[], dateKey: string): Task[] =>
  tasks.filter((task) => getTaskDateKey(task) === dateKey);

export const calculateTaskCompletionStats = (
  tasks: Task[],
  viewMode: ViewMode,
  selectedDateKey: string
): TaskCompletionStats => {
  const dateKeys = viewMode === 'day'
    ? [selectedDateKey]
    : viewMode === 'week'
      ? getWeekDateKeys(selectedDateKey)
      : getMonthDateKeys(selectedDateKey);
  const dateKeySet = new Set(dateKeys);
  const scopedTasks = tasks.filter((task) => (
    dateKeySet.has(getTaskDateKey(task))
  ));
  const completed = scopedTasks.filter((task) => task.completed).length;
  const total = scopedTasks.length;

  return {
    completed,
    total,
    completionRate: total > 0 ? (completed / total) * 100 : 0
  };
};

export const isRecurringDailyTask = (task: Task): boolean =>
  task.category === 'daily' && Boolean(task.templateId);

const getDailyTemplateKey = (value: Pick<DailyTaskTemplate | Task, 'title' | 'points'>): string =>
  `${value.title.trim().toLowerCase()}::${Math.max(1, Math.round(value.points || 1))}`;

const pickRecurringTaskToKeep = (current: Task, candidate: Task): Task => {
  if (candidate.completed && !current.completed) return candidate;
  if (current.completed && !candidate.completed) return current;

  return getTaskCreatedTime(candidate) < getTaskCreatedTime(current) ? candidate : current;
};

const dedupeRecurringTasks = (tasks: Task[]): Task[] => {
  const preferredByKey = new Map<string, Task>();

  for (const task of tasks) {
    if (!isRecurringDailyTask(task)) continue;

    const taskDateKey = getTaskDateKey(task);
    const key = `${taskDateKey}::${getDailyTemplateKey(task)}`;
    const current = preferredByKey.get(key);
    preferredByKey.set(key, current ? pickRecurringTaskToKeep(current, task) : task);
  }

  if (!preferredByKey.size) return tasks;

  const emittedKeys = new Set<string>();
  const dedupedTasks: Task[] = [];

  for (const task of tasks) {
    if (!isRecurringDailyTask(task)) {
      dedupedTasks.push(task);
      continue;
    }

    const taskDateKey = getTaskDateKey(task);
    const key = `${taskDateKey}::${getDailyTemplateKey(task)}`;
    const preferredTask = preferredByKey.get(key);
    if (emittedKeys.has(key) || preferredTask?.id !== task.id) continue;

    emittedKeys.add(key);
    dedupedTasks.push(task);
  }

  return dedupedTasks.length === tasks.length ? tasks : dedupedTasks;
};

const dedupeDailyTemplates = (templates: DailyTaskTemplate[]): DailyTaskTemplate[] => {
  const preferredByKey = new Map<string, DailyTaskTemplate>();

  for (const template of templates) {
    if (!template.active) continue;

    const key = getDailyTemplateKey(template);
    const current = preferredByKey.get(key);
    if (!current || getLocalDateKey(template.createdAt) < getLocalDateKey(current.createdAt)) {
      preferredByKey.set(key, template);
    }
  }

  const emittedKeys = new Set<string>();
  const dedupedTemplates: DailyTaskTemplate[] = [];

  for (const template of templates) {
    if (!template.active) {
      dedupedTemplates.push(template);
      continue;
    }

    const key = getDailyTemplateKey(template);
    const preferredTemplate = preferredByKey.get(key);
    if (emittedKeys.has(key) || preferredTemplate?.id !== template.id) continue;

    emittedKeys.add(key);
    dedupedTemplates.push(template);
  }

  return dedupedTemplates;
};

export const ensureDailyTemplateTasks = (
  data: GameData,
  dateKey: string,
  now = new Date().toISOString()
): GameData => {
  const templateById = new Map(data.dailyTemplates.map((template) => [template.id, template]));
  const cleanedTasks = data.tasks.filter((task) => {
    if (!task.templateId) return true;
    const template = templateById.get(task.templateId);
    if (!template) return true;
    return getTaskDateKey(task) >= getLocalDateKey(template.createdAt);
  });
  const dedupedTasks = dedupeRecurringTasks(cleanedTasks);
  const activeTemplates = dedupeDailyTemplates(data.dailyTemplates).filter(
    (template) => template.active && dateKey >= getLocalDateKey(template.createdAt)
  );
  const hasCleanedTasks = dedupedTasks.length !== data.tasks.length;
  if (!activeTemplates.length) {
    return hasCleanedTasks
      ? reconcileGameDataPoints({ ...data, tasks: dedupedTasks, updatedAt: now }, now)
      : data;
  }

  const existingTemplateKeys = new Set(
    filterTasksByDate(dedupedTasks, dateKey)
      .filter(isRecurringDailyTask)
      .map(getDailyTemplateKey)
  );
  const tasksToAdd = activeTemplates
    .filter((template) => !existingTemplateKeys.has(getDailyTemplateKey(template)))
    .map((template) => ({
      id: `task-${dateKey}-${template.id}`,
      title: template.title,
      category: 'daily' as const,
      points: template.points,
      completed: false,
      createdAt: createTaskTimestampForDate(dateKey, now),
      templateId: template.id
    }));

  if (!tasksToAdd.length) {
    return hasCleanedTasks
      ? reconcileGameDataPoints({ ...data, tasks: dedupedTasks, updatedAt: now }, now)
      : data;
  }

  return reconcileGameDataPoints({
    ...data,
    tasks: [...tasksToAdd, ...dedupedTasks],
    updatedAt: now
  }, now);
};

export const createInitialGameData = (now = new Date().toISOString()): GameData => ({
  profileName: '',
  tasks: initialTasks.map(normalizeTask),
  dailyTemplates: [],
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

const normalizeGameData = (data: GameData): GameData => ({
  ...data,
  profileName: typeof data.profileName === 'string' ? data.profileName : '',
  dailyTemplates: Array.isArray(data.dailyTemplates) ? data.dailyTemplates : []
});

const hasUserGameContent = (data: GameData): boolean =>
  data.tasks.length > 0 ||
  data.redeemHistory.length > 0 ||
  data.npcMessages.length > 0 ||
  data.redeemedRewardIds.length > 0;

export const mergeGameData = (local: GameData, cloud: GameData | null | undefined): GameData => {
  const cleanLocal = normalizeGameData(resetExampleGameData(local));
  const cleanCloud = cloud ? normalizeGameData(resetExampleGameData(cloud)) : null;
  if (!cleanCloud) return cleanLocal;

  if (hasUserGameContent(cleanLocal) && !hasUserGameContent(cleanCloud)) {
    return reconcileGameDataPoints(cleanLocal);
  }

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
    const cleanData = reconcileGameDataPoints(normalizeGameData(resetExampleGameData(data)), now);
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
