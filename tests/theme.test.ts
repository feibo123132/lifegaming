import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_THEME_MODE,
  getNextThemeMode,
  getThemeCopy,
  getThemeModeClassName,
  getThemeModeLabel,
  normalizeThemeMode
} from '../src/lib/theme.ts';

test('labels reward-only tasks in both themes', () => {
  assert.equal(getThemeCopy('pop').rewardOnly, '只奖不罚');
  assert.equal(getThemeCopy('cultivation').rewardOnly, '有赏无罚');
});

test('uses pop as the default theme mode', () => {
  assert.equal(DEFAULT_THEME_MODE, 'pop');
  assert.equal(normalizeThemeMode(null), 'pop');
  assert.equal(normalizeThemeMode('unknown'), 'pop');
});

test('normalizes supported theme modes', () => {
  assert.equal(normalizeThemeMode('pop'), 'pop');
  assert.equal(normalizeThemeMode('cultivation'), 'cultivation');
});

test('toggles between pop and cultivation theme modes', () => {
  assert.equal(getNextThemeMode('pop'), 'cultivation');
  assert.equal(getNextThemeMode('cultivation'), 'pop');
});

test('maps theme modes to stable root class names and labels', () => {
  assert.equal(getThemeModeClassName('pop'), 'theme-pop');
  assert.equal(getThemeModeClassName('cultivation'), 'theme-cultivation');
  assert.equal(getThemeModeLabel('pop'), 'POP');
  assert.equal(getThemeModeLabel('cultivation'), '国风');
});

test('keeps the original product language in POP mode', () => {
  const copy = getThemeCopy('pop');

  assert.equal(copy.points, '积分');
  assert.equal(copy.availablePoints, '可用积分');
  assert.equal(copy.experience, '经验值');
  assert.equal(copy.navTasks, '任务');
  assert.equal(copy.navShop, '积分商城');
  assert.equal(copy.navData, '数据记录');
  assert.equal(copy.navReview, '复盘中心');
});

test('uses light-cultivation language in cultivation mode', () => {
  const copy = getThemeCopy('cultivation');

  assert.equal(copy.points, '灵石');
  assert.equal(copy.availablePoints, '可用灵石');
  assert.equal(copy.experience, '修为');
  assert.equal(copy.currentLevel, '当前境界');
  assert.equal(copy.navTasks, '修行');
  assert.equal(copy.navShop, '万象阁');
  assert.equal(copy.navData, '起居录');
  assert.equal(copy.navReview, '省身录');
  assert.equal(copy.mainTask, '主修');
  assert.equal(copy.sideTask, '辅修');
  assert.equal(copy.dailyTask, '日课');
  assert.equal(copy.redeemNow, '收入囊中');
  assert.equal(copy.redeemHistory, '灵石账簿');
});
