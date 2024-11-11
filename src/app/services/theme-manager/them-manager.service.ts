import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, Renderer2, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeManagerService {
  Theme!: 'light' | 'dark';
  theme = signal<Theme>('light');
  private darkThemeLink: HTMLLinkElement | null = null;

  private _document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      if (this.theme() === 'dark') {
        this._document.documentElement.classList.add('dark');
        this.enableDarkTheme();
      } else {
        this._document.documentElement.classList.remove('dark');
        this.disableDarkTheme();
      }
    });
  }

  toggleTheme() {
    this.theme.update((value) => {
      return value === 'light' ? 'dark' : 'light';
    });
  }

  // Method to add the dark theme CSS file
  enableDarkTheme() {
    if (!this.darkThemeLink) {
      this.darkThemeLink = document.createElement('link'); //this.renderer.createElement('link');
      this.darkThemeLink!.rel = 'stylesheet';
      this.darkThemeLink!.href =
        'assets/@ionic/angular/css/palettes/dark.system.css';
      document.head.appendChild(this.darkThemeLink);
    }
  }

  // Method to remove the dark theme CSS file
  disableDarkTheme() {
    if (this.darkThemeLink) {
      document.head.removeChild(this.darkThemeLink);
      this.darkThemeLink = null;
    }
  }
}
