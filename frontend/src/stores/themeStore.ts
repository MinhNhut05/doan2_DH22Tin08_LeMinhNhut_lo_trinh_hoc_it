import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
  // Đọc từ localStorage khi init
  const saved = (typeof window !== 'undefined' ? localStorage.getItem('theme') : null) as Theme | null;
  const initial: Theme = saved ?? 'light';

  // Apply class ngay khi store init
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }

  return {
    theme: initial,
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
        return { theme: next };
      }),
    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      set({ theme });
    },
  };
});
