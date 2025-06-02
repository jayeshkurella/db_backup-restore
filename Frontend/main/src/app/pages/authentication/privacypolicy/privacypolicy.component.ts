
import { CommonModule } from '@angular/common';
import { Component, HostBinding, HostListener } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PrivacyrouteService } from './privacyroute.service';
import { ThemeService } from 'src/app/services/Theme.service';

@Component({
  selector: 'app-privacypolicy',
  imports: [CommonModule, MatButtonModule, MatListModule, MatIconModule, MatDividerModule],
  templateUrl: './privacypolicy.component.html',
  styleUrl: './privacypolicy.component.scss',
  host: {
    style: 'display: block; width: 100%; height: 100%;'
  }
})
export class PrivacypolicyComponent {
  selectedTab: string = 'privacy';
  sidebarOpen = true;
  @HostBinding('class') currentTheme: string = 'light-theme';

  constructor(private router: Router, private previousRouteService: PrivacyrouteService, private themeService: ThemeService) {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme === 'dark' ? 'dark-theme' : 'light-theme';
    });
  }
  // Toggle sidebar
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  // Close sidebar when clicking a nav item on mobile
  onNavItemClick() {
    if (window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
  }
  // Close sidebar when clicking outside on mobile
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (window.innerWidth < 992 &&
      !target.closest('.sidenav') &&
      !target.closest('.sidebar-toggle') &&
      this.sidebarOpen) {
      this.sidebarOpen = false;
    }
  }

  // Handle window resize
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth >= 992) {
      this.sidebarOpen = true;
    } else {
      this.sidebarOpen = false;
    }
  }
  getThemeClass(): string {
    return this.currentTheme;
  }
  agreeAndReturn() {
    localStorage.setItem('userAgreedToPrivacy', 'true');
    this.router.navigate(['/authentication/side-register']);
  }

  disagreeAndReturn() {
    localStorage.setItem('userAgreedToPrivacy', 'false');
    this.router.navigate(['/authentication/side-register']);
  }

  goBack() {
    this.previousRouteService.goBack('/');
  }
}