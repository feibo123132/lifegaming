const TASK_COMPLETION_FIXED_SOUND_PATH = 'sounds/completion-fixed.wav';

const TASK_COMPLETION_RANDOM_SOUND_PATHS = [
  'sounds/sound1.wav',
  'sounds/sound2.wav',
  'sounds/sound3.wav',
  'sounds/sound4.wav',
  'sounds/sound5.wav',
  'sounds/sound6.wav',
  'sounds/sound7.wav',
  'sounds/sound8.wav',
  'sounds/sound9.wav',
  'sounds/sound10.wav',
  'sounds/sound11.wav',
  'sounds/sound12.wav'
] as const;

type AudioElement = HTMLAudioElement & {
  play: () => Promise<void> | void;
};

let fixedTaskCompletionSound: AudioElement | null = null;
let randomTaskCompletionSound: AudioElement | null = null;

const getBaseUrl = () => {
  const meta = import.meta as ImportMeta & { env?: { BASE_URL?: string } };
  const baseUrl = meta.env?.BASE_URL || '/';
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

const resolveSoundUrl = (path: string) => `${getBaseUrl()}${path}`;

const playAudio = (audio: AudioElement) => {
  audio.currentTime = 0;
  const playPromise = audio.play();

  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => undefined);
  }
};

export const shouldPlayTaskCompletionSound = (awardedPoints: number) => awardedPoints > 0;

export const playTaskCompletionSound = () => {
  if (typeof Audio === 'undefined') {
    return;
  }

  if (!fixedTaskCompletionSound) {
    fixedTaskCompletionSound = new Audio(resolveSoundUrl(TASK_COMPLETION_FIXED_SOUND_PATH)) as AudioElement;
    fixedTaskCompletionSound.preload = 'auto';
  }

  fixedTaskCompletionSound.volume = 0.15;
  playAudio(fixedTaskCompletionSound);

  if (!randomTaskCompletionSound) {
    randomTaskCompletionSound = new Audio() as AudioElement;
    randomTaskCompletionSound.preload = 'auto';
  }

  const randomIndex = Math.floor(Math.random() * TASK_COMPLETION_RANDOM_SOUND_PATHS.length);
  randomTaskCompletionSound.src = resolveSoundUrl(TASK_COMPLETION_RANDOM_SOUND_PATHS[randomIndex]);
  playAudio(randomTaskCompletionSound);
};
