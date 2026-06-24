export type CycleChallengeStatus = 'active' | 'completed' | 'failed';

export interface CycleChallenge {
  targetDays: number;
  completedDateKeys: string[];
  status: CycleChallengeStatus;
  failedAt?: string;
}

export interface TaskGrace {
  originalPoints: number;
  fromDateKey: string;
  grantedAt: string;
}

export interface Task {
  id: string;
  title: string;
  category: 'main' | 'side' | 'daily';
  points: number;
  completed: boolean;
  createdAt?: string;
  completedPoints?: number;
  completedAt?: Date;
  templateId?: string;
  failureReason?: string;
  challenge?: CycleChallenge;
  rewardOnly?: boolean;
  grace?: TaskGrace;
}

export interface DailyTaskTemplate {
  id: string;
  title: string;
  points: number;
  active: boolean;
  createdAt: string;
  rewardOnly?: boolean;
}

export interface SleepRecord {
  id: string;
  date: string;
  duration: number;
  deepSleep: number;
  quality: number;
}

export interface DietRecord {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
}

export interface ExerciseRecord {
  id: string;
  date: string;
  type: string;
  duration: number;
  calories: number;
}

export interface VideoProject {
  id: string;
  title: string;
  stage: 'idea' | 'script' | 'shoot' | 'edit' | 'publish';
  progress: number;
  deadline: string;
}

export type RewardCategoryId = 'delight' | 'recovery' | 'escape' | 'investment';

export interface RewardCategory {
  id: RewardCategoryId;
  title: string;
  description: string;
  icon: string;
  colorClassName: string;
}

export interface Reward {
  id: string;
  name: string;
  points: number;
  icon: string;
  category: RewardCategoryId;
  redeemed: boolean;
}

export interface WeeklyReport {
  week: string;
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  sleepDays: number;
  exerciseDays: number;
}

export type ViewMode = 'day' | 'week' | 'month';

export type TabType = 'dashboard' | 'tasks' | 'data' | 'npc' | 'shop' | 'review';
