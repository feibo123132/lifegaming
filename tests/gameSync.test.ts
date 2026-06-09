import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCloudGameState,
  createUserTask,
  createInitialGameData,
  getCloudSyncErrorMessage,
  isExampleGameData,
  mergeGameData,
  normalizeUserEmail,
  pickLatestCloudGameDoc,
  reconcileGameDataPoints,
  resetExampleGameData,
  sortTasksForDisplay,
  toggleUserTaskCompletion,
  updateUserTask
} from '../src/lib/gameSync.ts';

test('normalizes email before using it as sync user id', () => {
  assert.equal(normalizeUserEmail('  ANGO@QQ.COM '), 'ango@qq.com');
});

test('creates an empty personal game data snapshot by default', () => {
  const data = createInitialGameData('2026-06-09T00:00:00.000Z');

  assert.equal(data.tasks.length, 0);
  assert.equal(data.userPoints, 0);
  assert.equal(data.redeemedRewardIds.length, 0);
  assert.equal(data.redeemHistory.length, 0);
  assert.equal(data.npcMessages.length, 0);
});

test('creates a clean user task from form input', () => {
  const task = createUserTask(
    { title: '  每天写复盘  ', category: 'daily', points: 15 },
    'task-1',
    '2026-06-09T01:00:00.000Z'
  );

  assert.deepEqual(task, {
    id: 'task-1',
    title: '每天写复盘',
    category: 'daily',
    points: 15,
    completed: false,
    createdAt: '2026-06-09T01:00:00.000Z'
  });
});

test('does not create a task with a blank title', () => {
  assert.equal(createUserTask({ title: '   ', category: 'main', points: 20 }, 'task-1'), null);
});

test('updates task title and points from edit input', () => {
  const task = createUserTask({ title: '旧任务', category: 'main', points: 10 }, 'task-1');
  assert.ok(task);

  const updated = updateUserTask(task, { title: '  新任务  ', points: 25 });

  assert.deepEqual(updated, {
    ...task,
    title: '新任务',
    points: 25
  });
});

test('does not update a task with a blank title', () => {
  const task = createUserTask({ title: '旧任务', category: 'main', points: 10 }, 'task-1');
  assert.ok(task);

  assert.equal(updateUserTask(task, { title: '   ', points: 25 }), null);
});

test('sorts tasks by category priority and then newest creation time', () => {
  const dailyNew = createUserTask(
    { title: '新日常', category: 'daily', points: 5 },
    'task-daily-new',
    '2026-06-09T04:00:00.000Z'
  );
  const mainOld = createUserTask(
    { title: '旧主线', category: 'main', points: 10 },
    'task-main-old',
    '2026-06-09T01:00:00.000Z'
  );
  const sideNew = createUserTask(
    { title: '新支线', category: 'side', points: 8 },
    'task-side-new',
    '2026-06-09T03:00:00.000Z'
  );
  const mainNew = createUserTask(
    { title: '新主线', category: 'main', points: 10 },
    'task-main-new',
    '2026-06-09T02:00:00.000Z'
  );

  assert.ok(dailyNew);
  assert.ok(mainOld);
  assert.ok(sideNew);
  assert.ok(mainNew);

  assert.deepEqual(
    sortTasksForDisplay([dailyNew, mainOld, sideNew, mainNew]).map((task) => task.title),
    ['新主线', '旧主线', '新支线', '新日常']
  );
});

test('awards points when a task is completed', () => {
  const task = createUserTask(
    { title: '完成任务', category: 'daily', points: 15 },
    'task-1',
    '2026-06-09T01:00:00.000Z'
  );
  assert.ok(task);

  const result = toggleUserTaskCompletion(task, '2026-06-09T02:00:00.000Z');

  assert.equal(result.pointsDelta, 15);
  assert.equal(result.task.completed, true);
  assert.equal(result.task.completedPoints, 15);
});

test('subtracts previously awarded points when completion is cancelled', () => {
  const task = {
    ...createUserTask(
      { title: '取消完成任务', category: 'daily', points: 50 },
      'task-1',
      '2026-06-09T01:00:00.000Z'
    )!,
    completed: true,
    completedPoints: 15,
    completedAt: '2026-06-09T02:00:00.000Z' as unknown as Date
  };

  const result = toggleUserTaskCompletion(task, '2026-06-09T03:00:00.000Z');

  assert.equal(result.pointsDelta, -15);
  assert.equal(result.task.completed, false);
  assert.equal(result.task.completedPoints, undefined);
  assert.equal(result.task.completedAt, undefined);
});

test('repairs bug-earned points when no task is completed', () => {
  const dirty = {
    ...createInitialGameData('2026-06-09T00:00:00.000Z'),
    userPoints: 40
  };

  const repaired = reconcileGameDataPoints(dirty, '2026-06-09T01:00:00.000Z');

  assert.equal(repaired.userPoints, 0);
  assert.equal(repaired.updatedAt, '2026-06-09T01:00:00.000Z');
});

test('keeps points equal to completed task awards minus redeemed rewards', () => {
  const task = {
    ...createUserTask(
      { title: '完成任务', category: 'daily', points: 20 },
      'task-1',
      '2026-06-09T01:00:00.000Z'
    )!,
    completed: true,
    completedPoints: 20
  };
  const dirty = {
    ...createInitialGameData('2026-06-09T00:00:00.000Z'),
    tasks: [task],
    userPoints: 999,
    redeemHistory: [
      { id: 'reward-1', name: '奖励', date: '2026-06-09', points: 5 }
    ]
  };

  const repaired = reconcileGameDataPoints(dirty, '2026-06-09T01:00:00.000Z');

  assert.equal(repaired.userPoints, 15);
});

test('builds a single cloud document scoped by email', () => {
  const data = createInitialGameData('2026-06-09T00:00:00.000Z');
  const doc = buildCloudGameState('ango@qq.com', data, '2026-06-09T01:00:00.000Z');

  assert.equal(doc.userId, 'ango@qq.com');
  assert.equal(doc.version, 1);
  assert.equal(doc.data.tasks.length, 0);
  assert.equal(doc.updateTime, '2026-06-09T01:00:00.000Z');
});

test('keeps the newer game data when merging cloud and local snapshots', () => {
  const completedTask = {
    ...createUserTask(
      { title: '完成任务', category: 'daily', points: 500 },
      'task-1',
      '2026-06-09T00:00:00.000Z'
    )!,
    completed: true,
    completedPoints: 500
  };
  const local = {
    ...createInitialGameData('2026-06-09T01:00:00.000Z'),
    userPoints: 100
  };
  const cloud = {
    ...createInitialGameData('2026-06-09T02:00:00.000Z'),
    tasks: [completedTask],
    userPoints: 500
  };

  assert.equal(mergeGameData(local, cloud).userPoints, 500);
  assert.equal(mergeGameData(cloud, local).userPoints, 500);
});

test('detects and resets the bundled example game data', () => {
  const example = {
    ...createInitialGameData('2026-06-09T00:00:00.000Z'),
    tasks: [
      {
        id: 'example-task',
        title: '发布本周第一条视频',
        category: 'main' as const,
        points: 50,
        completed: false
      }
    ],
    userPoints: 1580,
    redeemedRewardIds: ['movie', 'coffee'],
    updatedAt: '2026-06-09T00:00:00.000Z'
  };

  assert.equal(isExampleGameData(example), true);
  assert.equal(resetExampleGameData(example).tasks.length, 0);
  assert.equal(resetExampleGameData(example).userPoints, 0);
});

test('explains CloudBase network errors with setup guidance', () => {
  assert.equal(
    getCloudSyncErrorMessage(
      { message: 'network request error' },
      '云端同步失败，请稍后重试'
    ),
    '网络请求失败，请检查 CloudBase Web 安全域名、环境 ID 和当前网络。'
  );
});

test('picks the latest cloud game document when duplicates exist', () => {
  const oldData = createInitialGameData('2026-06-09T01:00:00.000Z');
  const newData = createInitialGameData('2026-06-09T02:00:00.000Z');

  const latest = pickLatestCloudGameDoc([
    {
      _id: 'old',
      userId: 'ango@qq.com',
      version: 1,
      data: oldData,
      updateTime: '2026-06-09T01:00:00.000Z'
    },
    {
      _id: 'new',
      userId: 'ango@qq.com',
      version: 1,
      data: newData,
      updateTime: '2026-06-09T02:00:00.000Z'
    }
  ]);

  assert.equal(latest?._id, 'new');
});
