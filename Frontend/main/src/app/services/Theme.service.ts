import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('light');  // default fallback
  theme$ = this.themeSubject.asObservable();

  constructor() {
    const storedTheme = localStorage.getItem('selectedTheme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      this.themeSubject.next(storedTheme);
      this.applyTheme(storedTheme);
    }
  }

  setTheme(theme: string): void {
    if (theme === 'dark' || theme === 'light') {
      localStorage.setItem('selectedTheme', theme);
      this.themeSubject.next(theme);
      this.applyTheme(theme);
      console.log("Theme updated:", theme);
    } else {
      console.warn("Invalid theme:", theme);
    }
  }

  getCurrentTheme(): string {
    return this.themeSubject.value;
  }

  private applyTheme(theme: string): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }
}
