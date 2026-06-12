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

type SoundUrlOptions = {
  baseUrl?: string;
  pathname?: string;
};

const normalizeBaseUrl = (baseUrl: string) => {
  if (!baseUrl || baseUrl === '.') {
    return '/';
  }

  const withLeadingSlash = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

const getRuntimeBaseUrl = (pathname?: string) => {
  const currentPathname = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  const firstSegment = currentPathname.match(/^\/([^/]+)(?:\/|$)/)?.[1];

  return firstSegment ? `/${firstSegment}/` : null;
};

const getViteBaseUrl = () => {
  const meta = import.meta as ImportMeta & { env?: { BASE_URL?: string } };
  return meta.env?.BASE_URL || '/';
};

export const resolveTaskCompletionSoundUrl = (
  path: string,
  options: SoundUrlOptions = {}
) => {
  const baseUrl = getRuntimeBaseUrl(options.pathname) ?? normalizeBaseUrl(options.baseUrl ?? getViteBaseUrl());
  const normalizedPath = path.replace(/^\/+/, '');

  return `${baseUrl}${normalizedPath}`;
};

const playAudio = (audio: AudioElement) => {
  audio.currentTime = 0;
  const playPromise = audio.play();

  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => undefined);
  }
};

export const shouldPlayTaskCompletionSound = (awardedPoints: number) => awardedPoints > 0;

export const shouldPlayTaskCompletionSoundBeforeToggle = (
  isCurrentlyCompleted: boolean,
  taskPoints: number
) => !isCurrentlyCompleted && taskPoints > 0;

export const playTaskCompletionSound = () => {
  if (typeof Audio === 'undefined') {
    return;
  }

  if (!fixedTaskCompletionSound) {
    fixedTaskCompletionSound = new Audio(resolveTaskCompletionSoundUrl(TASK_COMPLETION_FIXED_SOUND_PATH)) as AudioElement;
    fixedTaskCompletionSound.preload = 'auto';
  }

  fixedTaskCompletionSound.volume = 0.15;
  playAudio(fixedTaskCompletionSound);

  if (!randomTaskCompletionSound) {
    randomTaskCompletionSound = new Audio() as AudioElement;
    randomTaskCompletionSound.preload = 'auto';
  }

  const randomIndex = Math.floor(Math.random() * TASK_COMPLETION_RANDOM_SOUND_PATHS.length);
  randomTaskCompletionSound.src = resolveTaskCompletionSoundUrl(TASK_COMPLETION_RANDOM_SOUND_PATHS[randomIndex]);
  playAudio(randomTaskCompletionSound);
};
