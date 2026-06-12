import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveTaskCompletionSoundUrl,
  shouldPlayTaskCompletionSound,
  shouldPlayTaskCompletionSoundBeforeToggle
} from '../src/lib/taskCompletionSound.ts';

test('plays the task completion sound only when completing awards points', () => {
  assert.equal(shouldPlayTaskCompletionSound(10), true);
  assert.equal(shouldPlayTaskCompletionSound(1), true);
  assert.equal(shouldPlayTaskCompletionSound(0), false);
  assert.equal(shouldPlayTaskCompletionSound(-10), false);
});

test('can decide synchronously before async task toggling starts', () => {
  assert.equal(shouldPlayTaskCompletionSoundBeforeToggle(false, 15), true);
  assert.equal(shouldPlayTaskCompletionSoundBeforeToggle(true, 15), false);
  assert.equal(shouldPlayTaskCompletionSoundBeforeToggle(false, 0), false);
});

test('resolves sound urls under the current deployed base path', () => {
  assert.equal(
    resolveTaskCompletionSoundUrl('sounds/completion-fixed.wav', {
      baseUrl: '/',
      pathname: '/lifegaming/'
    }),
    '/lifegaming/sounds/completion-fixed.wav'
  );
  assert.equal(
    resolveTaskCompletionSoundUrl('/sounds/sound9.wav', {
      baseUrl: '/lifegaming/',
      pathname: '/'
    }),
    '/lifegaming/sounds/sound9.wav'
  );
});
