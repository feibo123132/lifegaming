import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

export function getWeekDates(date: Date = new Date()): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
}

export function getMonthDates(date: Date = new Date()): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const dates: Date[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i));
  }
  return dates;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const CATEGORY_LABELS: Record<string, string> = {
  main: '主线任务',
  side: '支线任务',
  daily: '日常任务',
};

export const CATEGORY_COLORS: Record<string, string> = {
  main: 'bg-blue-100 text-blue-700 border-blue-200',
  side: 'bg-green-100 text-green-700 border-green-200',
  daily: 'bg-purple-100 text-purple-700 border-purple-200',
};