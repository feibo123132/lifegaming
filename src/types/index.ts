export interface Task {
  id: string;
  title: string;
  category: 'main' | 'side' | 'daily';
  points: number;
  completed: boolean;
  createdAt?: string;
  completedPoints?: number;
  completedAt?: Date;
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

export interface Reward {
  id: string;
  name: string;
  points: number;
  icon: string;
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
