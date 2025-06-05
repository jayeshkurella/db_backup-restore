import { Injectable } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PrivacyrouteService {

    private previousUrl: string | null = null;
  private currentUrl: string | null = null;
  private isInitialNavigation = true;

  constructor(private router: Router) {
    // Track initial navigation separately
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        if (this.isInitialNavigation) {
          this.isInitialNavigation = false;
          this.currentUrl = this.router.url;
        }
      });

    // Track all subsequent navigations
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Skip the very first NavigationEnd event
        if (this.isInitialNavigation) return;
        
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  public getPreviousUrl(): string | null {
    return this.previousUrl;
  }

  public goBack(defaultRoute: string = '/') {
    // Special case: If coming from external link or first navigation
    if (!this.previousUrl || this.previousUrl === this.currentUrl) {
      // Check browser history as fallback
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      this.router.navigate([defaultRoute]);
      return;
    }
    this.router.navigateByUrl(this.previousUrl);
  }

}
