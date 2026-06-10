import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCloudGameState,
  createTaskTimestampForDate,
  createUserTask,
  createInitialGameData,
  ensureDailyTemplateTasks,
  filterTasksByDate,
  getCloudSyncErrorMessage,
  getLevelExpRequirement,
  getLevelTitle,
  getLocalDateKey,
  getPlayerProgress,
  isRecurringDailyTask,
  isExampleGameData,
  mergeGameData,
  normalizeUserEmail,
  pickLatestCloudGameDoc,
  reconcileGameDataPoints,
  resetExampleGameData,
  shiftDateKey,
  shouldUseLocalGameDataForSync,
  sortTasksForDisplay,
  toggleUserTaskCompletion,
  updateUserTask
} from '../src/lib/gameSync.ts';
import { rewards } from '../src/data/mockData.ts';

test('normalizes email before using it as sync user id', () => {
  assert.equal(normalizeUserEmail('  ANGO@QQ.COM '), 'ango@qq.com');
});

test('only reuses local game data for the same sync identity', () => {
  assert.equal(shouldUseLocalGameDataForSync(null, 'ango@qq.com'), true);
  assert.equal(shouldUseLocalGameDataForSync('  ANGO@QQ.COM ', 'ango@qq.com'), true);
  assert.equal(shouldUseLocalGameDataForSync('old@qq.com', 'new@qq.com'), false);
});

test('creates an empty personal game data snapshot by default', () => {
  const data = createInitialGameData('2026-06-09T00:00:00.000Z');

  assert.equal(data.profileName, '');
  assert.equal(data.tasks.length, 0);
  assert.equal(data.userPoints, 0);
  assert.equal(data.redeemedRewardIds.length, 0);
  assert.equal(data.redeemHistory.length, 0);
  assert.equal(data.npcMessages.length, 0);
});

test('ships example rewards for the points shop', () => {
  assert.ok(rewards.length >= 6);
  assert.equal(new Set(rewards.map((reward) => reward.id)).size, rewards.length);

  for (const reward of rewards) {
    assert.ok(reward.name.trim().length > 0);
    assert.ok(reward.icon.trim().length > 0);
    assert.ok(reward.points > 0);
    assert.equal(reward.redeemed, false);
  }
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

test('creates a task timestamp for the selected day', () => {
  assert.equal(
    createTaskTimestampForDate('2026-06-10', '2026-06-09T08:30:15.000Z'),
    '2026-06-10T08:30:15.000'
  );
});

test('filters tasks by their local task day', () => {
  const june9 = createUserTask(
    { title: '6月9日任务', category: 'daily', points: 10 },
    'task-june-9',
    '2026-06-09T10:00:00.000'
  );
  const june10 = createUserTask(
    { title: '6月10日任务', category: 'main', points: 20 },
    'task-june-10',
    '2026-06-10T10:00:00.000'
  );

  assert.ok(june9);
  assert.ok(june10);
  assert.equal(getLocalDateKey('2026-06-10T10:00:00.000'), '2026-06-10');
  assert.deepEqual(filterTasksByDate([june9, june10], '2026-06-10').map((task) => task.title), [
    '6月10日任务'
  ]);
});

test('generates daily template tasks for a selected date without duplicates', () => {
  const data = {
    ...createInitialGameData('2026-06-10T00:00:00.000Z'),
    dailyTemplates: [
      {
        id: 'daily-template-1',
        title: '抖音：中午、晚睡前各一次，每次不超过20min',
        points: 10,
        active: true,
        createdAt: '2026-06-09T00:00:00.000'
      }
    ]
  };

  const withToday = ensureDailyTemplateTasks(data, '2026-06-10', '2026-06-10T08:00:00.000');
  const withTodayAgain = ensureDailyTemplateTasks(withToday, '2026-06-10', '2026-06-10T09:00:00.000');
  const withTomorrow = ensureDailyTemplateTasks(withTodayAgain, '2026-06-11', '2026-06-11T08:00:00.000');

  assert.equal(filterTasksByDate(withTodayAgain.tasks, '2026-06-10').length, 1);
  assert.equal(filterTasksByDate(withTomorrow.tasks, '2026-06-11').length, 1);
  assert.equal(withTomorrow.tasks.length, 2);
  assert.equal(withTomorrow.tasks.every((task) => task.templateId === 'daily-template-1'), true);
});

test('does not generate daily template tasks before the template creation date', () => {
  const data = {
    ...createInitialGameData('2026-06-10T00:00:00.000Z'),
    dailyTemplates: [
      {
        id: 'daily-template-1',
        title: '抖音：中午、晚睡前各一次，每次不超过20min',
        points: 10,
        active: true,
        createdAt: '2026-06-10T08:00:00.000'
      }
    ]
  };

  const beforeTemplate = ensureDailyTemplateTasks(data, '2026-06-09', '2026-06-09T08:00:00.000');
  const onTemplateDate = ensureDailyTemplateTasks(data, '2026-06-10', '2026-06-10T09:00:00.000');

  assert.equal(filterTasksByDate(beforeTemplate.tasks, '2026-06-09').length, 0);
  assert.equal(filterTasksByDate(onTemplateDate.tasks, '2026-06-10').length, 1);
});

test('removes invalid recurring tasks generated before their template creation date', () => {
  const invalidPastTask = {
    ...createUserTask(
      { title: '错误生成的每天任务', category: 'daily', points: 10 },
      'task-2026-06-09-daily-template-1',
      '2026-06-09T08:00:00.000'
    )!,
    templateId: 'daily-template-1'
  };
  const manualPastTask = createUserTask(
    { title: '手动日常', category: 'daily', points: 10 },
    'manual-daily',
    '2026-06-09T09:00:00.000'
  )!;
  const data = {
    ...createInitialGameData('2026-06-10T00:00:00.000Z'),
    tasks: [invalidPastTask, manualPastTask],
    dailyTemplates: [
      {
        id: 'daily-template-1',
        title: '错误生成的每天任务',
        points: 10,
        active: true,
        createdAt: '2026-06-10T08:00:00.000'
      }
    ]
  };

  const cleaned = ensureDailyTemplateTasks(data, '2026-06-09', '2026-06-09T10:00:00.000');

  assert.deepEqual(filterTasksByDate(cleaned.tasks, '2026-06-09').map((task) => task.title), [
    '手动日常'
  ]);
});

test('marks only template-generated daily tasks as recurring daily tasks', () => {
  const normalDaily = createUserTask(
    { title: '普通日常', category: 'daily', points: 10 },
    'normal-daily',
    '2026-06-10T08:00:00.000'
  );
  const recurringDaily = {
    ...createUserTask(
      { title: '每日日常', category: 'daily', points: 10 },
      'recurring-daily',
      '2026-06-10T08:00:00.000'
    )!,
    templateId: 'daily-template-1'
  };
  const recurringMain = {
    ...createUserTask(
      { title: '异常主线', category: 'main', points: 10 },
      'recurring-main',
      '2026-06-10T08:00:00.000'
    )!,
    templateId: 'daily-template-1'
  };

  assert.ok(normalDaily);
  assert.equal(isRecurringDailyTask(normalDaily), false);
  assert.equal(isRecurringDailyTask(recurringDaily), true);
  assert.equal(isRecurringDailyTask(recurringMain), false);
});

test('shifts a selected date key by whole days', () => {
  assert.equal(shiftDateKey('2026-06-10', -1), '2026-06-09');
  assert.equal(shiftDateKey('2026-06-10', 1), '2026-06-11');
});

test('derives player level and exp from completed task points', () => {
  const smallTask = {
    ...createUserTask(
      { title: '小任务', category: 'daily', points: 60 },
      'task-small',
      '2026-06-10T08:00:00.000'
    )!,
    completed: true,
    completedPoints: 60,
    completedAt: '2026-06-10T09:00:00.000' as unknown as Date
  };
  const bigTask = {
    ...createUserTask(
      { title: '大任务', category: 'main', points: 70 },
      'task-big',
      '2026-06-10T10:00:00.000'
    )!,
    completed: true,
    completedPoints: 70,
    completedAt: '2026-06-10T11:00:00.000' as unknown as Date
  };
  const pendingTask = createUserTask(
    { title: '未完成', category: 'daily', points: 999 },
    'task-pending',
    '2026-06-10T12:00:00.000'
  )!;

  assert.deepEqual(getPlayerProgress([smallTask, bigTask, pendingTask], '2026-06-10'), {
    totalExp: 130,
    level: 2,
    exp: 30,
    maxExp: 110,
    expToNextLevel: 80,
    levelTitle: '炼气期初期',
    streak: 1
  });
});

test('uses increasing exp requirements for each level', () => {
  assert.equal(getLevelExpRequirement(1), 100);
  assert.equal(getLevelExpRequirement(2), 110);
  assert.equal(getLevelExpRequirement(3), 120);
  assert.equal(getLevelExpRequirement(10), 190);
});

test('carries total exp across increasing level thresholds', () => {
  const task = {
    ...createUserTask(
      { title: '累计经验', category: 'main', points: 210 },
      'task-exp',
      '2026-06-10T08:00:00.000'
    )!,
    completed: true,
    completedPoints: 210,
    completedAt: '2026-06-10T09:00:00.000' as unknown as Date
  };

  assert.deepEqual(getPlayerProgress([task], '2026-06-10'), {
    totalExp: 210,
    level: 3,
    exp: 0,
    maxExp: 120,
    expToNextLevel: 120,
    levelTitle: '炼气期初期',
    streak: 1
  });
});

test('returns cultivation titles for each ten-level band', () => {
  assert.equal(getLevelTitle(1), '炼气期初期');
  assert.equal(getLevelTitle(11), '筑基期初期');
  assert.equal(getLevelTitle(21), '结丹期初期');
  assert.equal(getLevelTitle(31), '元婴期初期');
  assert.equal(getLevelTitle(41), '化神期初期');
  assert.equal(getLevelTitle(51), '炼虚期初期');
  assert.equal(getLevelTitle(61), '合体期初期');
  assert.equal(getLevelTitle(71), '大乘期初期');
  assert.equal(getLevelTitle(81), '渡劫期初期');
  assert.equal(getLevelTitle(91), '飞升期初期');
});

test('adds minor cultivation stages within each ten-level band', () => {
  assert.equal(getLevelTitle(1), '炼气期初期');
  assert.equal(getLevelTitle(4), '炼气期中期');
  assert.equal(getLevelTitle(7), '炼气期后期');
  assert.equal(getLevelTitle(10), '炼气期大圆满');
  assert.equal(getLevelTitle(23), '结丹期初期');
  assert.equal(getLevelTitle(29), '结丹期后期');
  assert.equal(getLevelTitle(30), '结丹期大圆满');
});

test('keeps a streak alive when the latest completion was yesterday', () => {
  const twoDaysAgo = {
    ...createUserTask(
      { title: '前天任务', category: 'daily', points: 10 },
      'task-two-days-ago',
      '2026-06-08T08:00:00.000'
    )!,
    completed: true,
    completedAt: '2026-06-08T09:00:00.000' as unknown as Date
  };
  const yesterday = {
    ...createUserTask(
      { title: '昨天任务', category: 'daily', points: 10 },
      'task-yesterday',
      '2026-06-09T08:00:00.000'
    )!,
    completed: true,
    completedAt: '2026-06-09T09:00:00.000' as unknown as Date
  };

  assert.equal(getPlayerProgress([twoDaysAgo, yesterday], '2026-06-10').streak, 2);
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

test('does not let an empty cloud placeholder erase local tasks', () => {
  const localTask = createUserTask(
    { title: '重新登录后仍要保留', category: 'daily', points: 10 },
    'task-local',
    '2026-06-09T01:00:00.000Z'
  );
  assert.ok(localTask);

  const local = {
    ...createInitialGameData('2026-06-09T01:00:00.000Z'),
    tasks: [localTask]
  };
  const emptyCloud = createInitialGameData('2026-06-09T02:00:00.000Z');

  assert.deepEqual(mergeGameData(local, emptyCloud).tasks.map((task) => task.title), [
    '重新登录后仍要保留'
  ]);
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
