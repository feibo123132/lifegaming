import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldPlayTaskCompletionSound } from '../src/lib/taskCompletionSound.ts';

test('plays the task completion sound only when completing awards points', () => {
  assert.equal(shouldPlayTaskCompletionSound(10), true);
  assert.equal(shouldPlayTaskCompletionSound(1), true);
  assert.equal(shouldPlayTaskCompletionSound(0), false);
  assert.equal(shouldPlayTaskCompletionSound(-10), false);
});
