export type ThemeMode = 'pop' | 'cultivation';

export const DEFAULT_THEME_MODE: ThemeMode = 'pop';
export const THEME_MODE_STORAGE_KEY = 'lifegaming-theme-mode';

export const normalizeThemeMode = (value: unknown): ThemeMode =>
  value === 'cultivation' || value === 'pop' ? value : DEFAULT_THEME_MODE;

export const getNextThemeMode = (mode: ThemeMode): ThemeMode =>
  mode === 'pop' ? 'cultivation' : 'pop';

export const getThemeModeClassName = (mode: ThemeMode): string =>
  mode === 'cultivation' ? 'theme-cultivation' : 'theme-pop';

export const getThemeModeLabel = (mode: ThemeMode): string =>
  mode === 'cultivation' ? '国风' : 'POP';
