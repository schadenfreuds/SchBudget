export type Theme = 'light' | 'dark' | 'system';
export type ThemeMode = Theme;

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    return (localStorage.getItem('aile_butcesi_theme') as Theme) || 'system';
  } catch {
    return 'system';
  }
}

export function isDarkModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export function setTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('aile_butcesi_theme', theme);
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {}
}

export function toggleTheme(): 'light' | 'dark' {
  const currentlyDark = isDarkModeActive();
  const next = currentlyDark ? 'light' : 'dark';
  setTheme(next);
  return next;
}
