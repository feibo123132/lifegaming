import test from 'node:test';
import assert from 'node:assert/strict';

import {
  canGraceTaskOneDay,
  calculateAvailablePoints,
  calculateTaskCompletionStats,
  createUserTask,
  getLocalDateKey,
  getPlayerProgress,
  getTaskAwardedPoints,
  getTaskPenaltyPoints,
  graceUserTaskOneDay,
  toggleUserTaskCompletion,
  updateUserTask
} from '../src/lib/gameSync.ts';

test('uses the original points as the triple-penalty basis after grace', () => {
  const gracedTask = {
    ...createUserTask(
      { title: 'Deferred main task', category: 'main', points: 40, dateKey: '2026-06-12' },
      'task-graced',
      '2026-06-12T08:00:00.000'
    )!,
    points: 30,
    grace: {
      originalPoints: 40,
      fromDateKey: '2026-06-11',
      grantedAt: '2026-06-11T20:00:00.000'
    }
  };

  assert.equal(getTaskPenaltyPoints(gracedTask, '2026-06-13'), 120);
});

test('allows an unfinished ordinary task to use grace only once on its due date', () => {
  const task = createUserTask(
    { title: 'One-day grace', category: 'main', points: 40, dateKey: '2026-06-11' },
    'task-grace-once',
    '2026-06-11T08:00:00.000'
  )!;

  assert.equal(canGraceTaskOneDay(task, '2026-06-11', '2026-06-11'), true);
  const gracedTask = graceUserTaskOneDay(task, '2026-06-11', '2026-06-11T20:00:00.000');
  assert.equal(canGraceTaskOneDay(gracedTask, '2026-06-12', '2026-06-12'), false);
});

test('moves a graced task to tomorrow and reduces its reward by ten', () => {
  const task = createUserTask(
    { title: 'Move to tomorrow', category: 'main', points: 40, dateKey: '2026-06-11' },
    'task-grace-move',
    '2026-06-11T08:00:00.000'
  )!;
  const gracedTask = graceUserTaskOneDay(task, '2026-06-11', '2026-06-11T20:00:00.000');

  assert.equal(getLocalDateKey(gracedTask.createdAt), '2026-06-12');
  assert.equal(gracedTask.points, 30);
  assert.deepEqual(gracedTask.grace, {
    originalPoints: 40,
    fromDateKey: '2026-06-11',
    grantedAt: '2026-06-11T20:00:00.000'
  });
  assert.deepEqual(calculateTaskCompletionStats([gracedTask], 'day', '2026-06-11'), {
    completed: 0,
    total: 0,
    completionRate: 0
  });
  assert.equal(calculateTaskCompletionStats([gracedTask], 'day', '2026-06-12').total, 1);
});

test('floors a graced task reward at zero', () => {
  const task = createUserTask(
    { title: 'Low reward', category: 'side', points: 5, dateKey: '2026-06-11' },
    'task-grace-zero',
    '2026-06-11T08:00:00.000'
  )!;

  assert.equal(graceUserTaskOneDay(task, '2026-06-11', '2026-06-11T20:00:00.000').points, 0);
});

test('rejects grace for unsupported or non-current tasks', () => {
  const ordinary = createUserTask(
    { title: 'Ordinary', category: 'main', points: 40, dateKey: '2026-06-11' },
    'task-ordinary',
    '2026-06-11T08:00:00.000'
  )!;
  const completed = toggleUserTaskCompletion(ordinary, '2026-06-11T10:00:00.000').task;
  const rewardOnly = createUserTask(
    { title: 'Reward only', category: 'daily', points: 10, dateKey: '2026-06-11', rewardOnly: true },
    'task-reward-only-grace',
    '2026-06-11T08:00:00.000'
  )!;
  const recurring = { ...ordinary, id: 'task-recurring-grace', templateId: 'daily-template-1' };
  const challenge = createUserTask(
    { title: 'Challenge', category: 'daily', points: 5, dateKey: '2026-06-11', challengeDays: 3 },
    'task-challenge-grace',
    '2026-06-11T08:00:00.000'
  )!;

  assert.equal(canGraceTaskOneDay(completed, '2026-06-11', '2026-06-11'), false);
  assert.equal(canGraceTaskOneDay(rewardOnly, '2026-06-11', '2026-06-11'), false);
  assert.equal(canGraceTaskOneDay(recurring, '2026-06-11', '2026-06-11'), false);
  assert.equal(canGraceTaskOneDay(challenge, '2026-06-11', '2026-06-11'), false);
  assert.equal(canGraceTaskOneDay(ordinary, '2026-06-10', '2026-06-11'), false);
  assert.equal(canGraceTaskOneDay(ordinary, '2026-06-11', '2026-06-12'), false);
});

test('applies graced rewards on success and original triple penalties on failure', () => {
  const task = createUserTask(
    { title: 'Grace accounting', category: 'main', points: 40, dateKey: '2026-06-11' },
    'task-grace-accounting',
    '2026-06-11T08:00:00.000'
  )!;
  const gracedTask = graceUserTaskOneDay(task, '2026-06-11', '2026-06-11T20:00:00.000');
  const completed = toggleUserTaskCompletion(gracedTask, '2026-06-12T20:00:00.000').task;

  assert.equal(getTaskAwardedPoints(completed), 30);
  assert.equal(calculateAvailablePoints({ tasks: [gracedTask], redeemHistory: [] }, '2026-06-13'), -120);
  assert.equal(getPlayerProgress([gracedTask], '2026-06-13').totalExp, -120);
});

test('keeps the reduced reward locked when editing a graced task', () => {
  const task = createUserTask(
    { title: 'Original title', category: 'main', points: 40, dateKey: '2026-06-11' },
    'task-grace-edit',
    '2026-06-11T08:00:00.000'
  )!;
  const gracedTask = graceUserTaskOneDay(task, '2026-06-11', '2026-06-11T20:00:00.000');

  const updated = updateUserTask(gracedTask, { title: 'Updated title', points: 999 });

  assert.equal(updated?.title, 'Updated title');
  assert.equal(updated?.points, 30);
  assert.equal(updated?.grace?.originalPoints, 40);
});

