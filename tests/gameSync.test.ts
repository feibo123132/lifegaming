import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCloudGameState,
  createInitialGameData,
  mergeGameData,
  normalizeUserEmail
} from '../src/lib/gameSync.ts';

test('normalizes email before using it as sync user id', () => {
  assert.equal(normalizeUserEmail('  ANGO@QQ.COM '), 'ango@qq.com');
});

test('builds a single cloud document scoped by email', () => {
  const data = createInitialGameData('2026-06-09T00:00:00.000Z');
  const doc = buildCloudGameState('ango@qq.com', data, '2026-06-09T01:00:00.000Z');

  assert.equal(doc.userId, 'ango@qq.com');
  assert.equal(doc.version, 1);
  assert.equal(doc.data.tasks.length > 0, true);
  assert.equal(doc.updateTime, '2026-06-09T01:00:00.000Z');
});

test('keeps the newer game data when merging cloud and local snapshots', () => {
  const local = {
    ...createInitialGameData('2026-06-09T01:00:00.000Z'),
    userPoints: 100
  };
  const cloud = {
    ...createInitialGameData('2026-06-09T02:00:00.000Z'),
    userPoints: 500
  };

  assert.equal(mergeGameData(local, cloud).userPoints, 500);
  assert.equal(mergeGameData(cloud, local).userPoints, 500);
});
