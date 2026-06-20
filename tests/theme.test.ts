import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_THEME_MODE,
  getNextThemeMode,
  getThemeModeClassName,
  getThemeModeLabel,
  normalizeThemeMode
} from '../src/lib/theme.ts';

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
