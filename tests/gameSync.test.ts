import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCloudGameState,
  calculateAvailablePoints,
  calculateTaskCompletionStats,
  createTaskTimestampForDate,
  createUserTask,
  createInitialGameData,
  ensureDailyTemplateTasks,
  filterTasksByDate,
  getCloudSyncErrorMessage,
  getDefaultTaskPoints,
  getLevelExpRequirement,
  getLevelTitle,
  getLocalDateKey,
  getPlayerProgress,
  getTaskPenaltyPoints,
  getFailedTasksForReflection,
  isOverdueIncompleteTask,
  isRecurringDailyTask,
  isExampleGameData,
  mergeGameData,
  normalizeUserEmail,
  pickLatestCloudGameDoc,
  reconcileGameDataPoints,
  resetExampleGameData,
  saveTaskFailureReason,
  shiftDateKey,
  shouldUseLocalGameDataForSync,
  sortTasksForDisplay,
  toggleUserTaskCompletion,
  updateUserTask
} from '../src/lib/gameSync.ts';
import { rewardCategories, rewards } from '../src/data/mockData.ts';

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

test('ships a grouped self-care reward catalog', () => {
  const categoryIds = rewardCategories.map((category) => category.id);

  assert.deepEqual(categoryIds, ['delight', 'recovery', 'escape', 'investment']);
  assert.ok(rewards.length >= 16);

  for (const categoryId of categoryIds) {
    assert.ok(rewards.some((reward) => reward.category === categoryId));
  }

  for (const reward of rewards) {
    assert.ok(categoryIds.includes(reward.category));
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

test('returns default points for each task category', () => {
  assert.equal(getDefaultTaskPoints('main'), 20);
  assert.equal(getDefaultTaskPoints('side'), 15);
  assert.equal(getDefaultTaskPoints('daily'), 10);
});

test('can bind a newly created task to its daily template', () => {
  const task = createUserTask(
    { title: 'Daily screen limit', category: 'daily', points: 10, templateId: 'daily-template-1' },
    'task-1',
    '2026-06-10T08:00:00.000'
  );

  assert.equal(task?.templateId, 'daily-template-1');
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

test('marks only past-day incomplete tasks as overdue', () => {
  const overdue = createUserTask(
    { title: '昨天未完成', category: 'daily', points: 10, dateKey: '2026-06-11' },
    'task-overdue',
    '2026-06-11T08:00:00.000'
  )!;
  const todayOpen = createUserTask(
    { title: '今天未完成', category: 'daily', points: 10, dateKey: '2026-06-12' },
    'task-today',
    '2026-06-12T08:00:00.000'
  )!;
  const completedPast = toggleUserTaskCompletion(
    createUserTask(
      { title: '昨天已完成', category: 'daily', points: 10, dateKey: '2026-06-11' },
      'task-completed',
      '2026-06-11T08:00:00.000'
    )!,
    '2026-06-11T10:00:00.000'
  ).task;

  assert.equal(isOverdueIncompleteTask(overdue, '2026-06-12'), true);
  assert.equal(isOverdueIncompleteTask(todayOpen, '2026-06-12'), false);
  assert.equal(isOverdueIncompleteTask(completedPast, '2026-06-12'), false);
});

test('deducts triple task points from available points for overdue incomplete tasks', () => {
  const completed = toggleUserTaskCompletion(
    createUserTask(
      { title: '赚取积分', category: 'main', points: 100, dateKey: '2026-06-11' },
      'task-completed',
      '2026-06-11T08:00:00.000'
    )!,
    '2026-06-11T10:00:00.000'
  ).task;
  const overdue = createUserTask(
    { title: '扣分任务', category: 'daily', points: 10, dateKey: '2026-06-11' },
    'task-overdue',
    '2026-06-11T08:00:00.000'
  )!;
  const todayOpen = createUserTask(
    { title: '今天还没结束', category: 'daily', points: 10, dateKey: '2026-06-12' },
    'task-today',
    '2026-06-12T08:00:00.000'
  )!;

  assert.equal(getTaskPenaltyPoints(overdue, '2026-06-12'), 30);
  assert.equal(getTaskPenaltyPoints(todayOpen, '2026-06-12'), 0);
  assert.equal(calculateAvailablePoints({
    tasks: [completed, overdue, todayOpen],
    redeemHistory: []
  }, '2026-06-12'), 70);
});

test('deducts overdue incomplete task penalties from player experience', () => {
  const completed = toggleUserTaskCompletion(
    createUserTask(
      { title: '获得经验', category: 'main', points: 60, dateKey: '2026-06-11' },
      'task-completed',
      '2026-06-11T08:00:00.000'
    )!,
    '2026-06-11T10:00:00.000'
  ).task;
  const overdue = createUserTask(
    { title: '损失经验', category: 'daily', points: 10, dateKey: '2026-06-11' },
    'task-overdue',
    '2026-06-11T08:00:00.000'
  )!;

  assert.equal(getPlayerProgress([completed, overdue], '2026-06-12').totalExp, 30);
});

test('calculates task completion stats for day week and month views', () => {
  const mondayDone = toggleUserTaskCompletion(
    createUserTask(
      { title: '周一完成', category: 'daily', points: 10, dateKey: '2026-06-08' },
      'task-monday',
      '2026-06-08T08:00:00.000'
    )!,
    '2026-06-08T09:00:00.000'
  ).task;
  const selectedDayDone = toggleUserTaskCompletion(
    createUserTask(
      { title: '当天完成', category: 'main', points: 20, dateKey: '2026-06-11' },
      'task-selected',
      '2026-06-11T08:00:00.000'
    )!,
    '2026-06-11T09:00:00.000'
  ).task;
  const fridayOpen = createUserTask(
    { title: '周五未完成', category: 'side', points: 15, dateKey: '2026-06-12' },
    'task-friday',
    '2026-06-12T08:00:00.000'
  )!;
  const nextWeekDone = toggleUserTaskCompletion(
    createUserTask(
      { title: '下周完成', category: 'daily', points: 10, dateKey: '2026-06-15' },
      'task-next-week',
      '2026-06-15T08:00:00.000'
    )!,
    '2026-06-15T09:00:00.000'
  ).task;

  const tasks = [mondayDone, selectedDayDone, fridayOpen, nextWeekDone];

  assert.deepEqual(calculateTaskCompletionStats(tasks, 'day', '2026-06-11'), {
    completed: 1,
    total: 1,
    completionRate: 100
  });
  assert.deepEqual(calculateTaskCompletionStats(tasks, 'week', '2026-06-11'), {
    completed: 2,
    total: 3,
    completionRate: 66.66666666666666
  });
  assert.deepEqual(calculateTaskCompletionStats(tasks, 'month', '2026-06-11'), {
    completed: 3,
    total: 4,
    completionRate: 75
  });
});

test('finds failed unfinished tasks for reflection by day week and month ranges', () => {
  const mondayFailed = createUserTask(
    { title: 'Monday failed', category: 'daily', points: 10, dateKey: '2026-06-08' },
    'task-monday-failed',
    '2026-06-08T08:00:00.000'
  )!;
  const selectedFailed = createUserTask(
    { title: 'Selected failed', category: 'main', points: 20, dateKey: '2026-06-11' },
    'task-selected-failed',
    '2026-06-11T08:00:00.000'
  )!;
  const completedFailedDay = toggleUserTaskCompletion(
    createUserTask(
      { title: 'Completed should not reflect', category: 'side', points: 15, dateKey: '2026-06-12' },
      'task-completed',
      '2026-06-12T08:00:00.000'
    )!,
    '2026-06-12T10:00:00.000'
  ).task;
  const nextWeekFailed = createUserTask(
    { title: 'Next week failed', category: 'daily', points: 10, dateKey: '2026-06-15' },
    'task-next-week-failed',
    '2026-06-15T08:00:00.000'
  )!;
  const futureOpen = createUserTask(
    { title: 'Future open', category: 'daily', points: 10, dateKey: '2026-06-19' },
    'task-future-open',
    '2026-06-19T08:00:00.000'
  )!;
  const tasks = [mondayFailed, selectedFailed, completedFailedDay, nextWeekFailed, futureOpen];

  assert.deepEqual(
    getFailedTasksForReflection(tasks, 'day', '2026-06-11', '2026-06-17').map((task) => task.id),
    ['task-selected-failed']
  );
  assert.deepEqual(
    getFailedTasksForReflection(tasks, 'week', '2026-06-11', '2026-06-17').map((task) => task.id),
    ['task-monday-failed', 'task-selected-failed']
  );
  assert.deepEqual(
    getFailedTasksForReflection(tasks, 'month', '2026-06-11', '2026-06-17').map((task) => task.id),
    ['task-monday-failed', 'task-selected-failed', 'task-next-week-failed']
  );
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

test('deduplicates duplicate recurring task instances for the same selected date', () => {
  const duplicateA = {
    ...createUserTask(
      { title: 'Daily screen limit', category: 'daily', points: 10 },
      'task-a',
      '2026-06-11T08:00:00.000'
    )!,
    templateId: 'daily-template-1'
  };
  const duplicateB = {
    ...createUserTask(
      { title: 'Daily screen limit', category: 'daily', points: 10 },
      'task-b',
      '2026-06-11T09:00:00.000'
    )!,
    templateId: 'daily-template-1'
  };
  const data = {
    ...createInitialGameData('2026-06-10T00:00:00.000Z'),
    tasks: [duplicateA, duplicateB],
    dailyTemplates: [
      {
        id: 'daily-template-1',
        title: 'Daily screen limit',
        points: 10,
        active: true,
        createdAt: '2026-06-10T08:00:00.000'
      }
    ]
  };

  const cleaned = ensureDailyTemplateTasks(data, '2026-06-11', '2026-06-11T10:00:00.000');

  assert.equal(filterTasksByDate(cleaned.tasks, '2026-06-11').length, 1);
  assert.equal(filterTasksByDate(cleaned.tasks, '2026-06-11')[0].templateId, 'daily-template-1');
});

test('deduplicates duplicate daily templates with the same title and points', () => {
  const data = {
    ...createInitialGameData('2026-06-10T00:00:00.000Z'),
    dailyTemplates: [
      {
        id: 'daily-template-newer',
        title: 'Daily screen limit',
        points: 10,
        active: true,
        createdAt: '2026-06-10T09:00:00.000'
      },
      {
        id: 'daily-template-older',
        title: 'Daily screen limit',
        points: 10,
        active: true,
        createdAt: '2026-06-10T08:00:00.000'
      }
    ]
  };

  const generated = ensureDailyTemplateTasks(data, '2026-06-11', '2026-06-11T08:00:00.000');
  const generatedTasks = filterTasksByDate(generated.tasks, '2026-06-11');

  assert.equal(generatedTasks.length, 1);
  assert.equal(generatedTasks[0].title, 'Daily screen limit');
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

test('saves a failure reason only on the selected recurring task instance', () => {
  const yesterday = {
    ...createUserTask(
      { title: 'Daily screen limit', category: 'daily', points: 10, templateId: 'daily-template-1', dateKey: '2026-06-16' },
      'task-2026-06-16-daily-template-1',
      '2026-06-16T08:00:00.000'
    )!,
    templateId: 'daily-template-1'
  };
  const today = {
    ...createUserTask(
      { title: 'Daily screen limit', category: 'daily', points: 10, templateId: 'daily-template-1', dateKey: '2026-06-17' },
      'task-2026-06-17-daily-template-1',
      '2026-06-17T08:00:00.000'
    )!,
    templateId: 'daily-template-1'
  };
  const tomorrow = {
    ...createUserTask(
      { title: 'Daily screen limit', category: 'daily', points: 10, templateId: 'daily-template-1', dateKey: '2026-06-18' },
      'task-2026-06-18-daily-template-1',
      '2026-06-18T08:00:00.000'
    )!,
    templateId: 'daily-template-1'
  };

  const nextTasks = saveTaskFailureReason(
    [yesterday, today, tomorrow],
    today.id,
    '  Lunch scroll took too long.  '
  );

  assert.equal(nextTasks.find((task) => task.id === yesterday.id)?.failureReason, undefined);
  assert.equal(nextTasks.find((task) => task.id === today.id)?.failureReason, 'Lunch scroll took too long.');
  assert.equal(nextTasks.find((task) => task.id === tomorrow.id)?.failureReason, undefined);
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
