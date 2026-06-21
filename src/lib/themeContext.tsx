import { createContext, useContext, type ReactNode } from 'react';
import type { ThemeMode } from './theme';

const ThemeModeContext = createContext<ThemeMode>('pop');

interface ThemeModeProviderProps {
  children: ReactNode;
  mode: ThemeMode;
}

export function ThemeModeProvider({ children, mode }: ThemeModeProviderProps) {
  return (
    <ThemeModeContext.Provider value={mode}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export const useThemeMode = (): ThemeMode => useContext(ThemeModeContext);
