import { Injectable, computed, signal } from '@angular/core';

/** The two supported color themes. */
export type Theme = 'light' | 'dark';

/** localStorage key the chosen theme is persisted under. */
const THEME_STORAGE_KEY = 'electronics_theme';

/**
 * Owns the app's light/dark theme choice. Applies the theme as a
 * `data-theme` attribute on `<html>`, which `styles.css` (step 9)
 * uses to swap the CSS custom properties driving every component's
 * colors — so components never need to know about theming directly.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.loadInitialTheme());

  readonly theme = this.themeSignal.asReadonly();

  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  /** Flips between light and dark, applying and persisting the new choice. */
  toggle(): void {
    const next: Theme = this.isDark() ? 'light' : 'dark';
    this.themeSignal.set(next);
    this.applyTheme(next);
    this.saveTheme(next);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  private loadInitialTheme(): Theme {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored === 'dark' || stored === 'light' ? stored : 'light';
    } catch {
      return 'light';
    }
  }

  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable — theme choice just won't survive a reload.
    }
  }
}
