import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'nour_app_theme';

  // Default to dark theme as requested for the spiritual aesthetic
  readonly theme = signal<AppTheme>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.theme());

    // Listen to changes and apply
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
      try {
        localStorage.setItem(this.THEME_KEY, currentTheme);
      } catch (e) {
        // Handle private browsing or localStorage disabled
      }
    });
  }

  private getInitialTheme(): AppTheme {
    try {
      const saved = localStorage.getItem(this.THEME_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch (e) {}

    // Check system preference if no saved theme
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return 'dark';
  }

  toggleTheme(): void {
    this.theme.update(current => (current === 'dark' ? 'light' : 'dark'));
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document === 'undefined') return;

    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }
}
