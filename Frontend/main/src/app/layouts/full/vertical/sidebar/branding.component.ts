import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from 'src/app/services/core.service';
import { Location } from '@angular/common'; // Add this import

@Component({
  selector: 'app-branding',
  standalone: true, // Add this for Angular 14+ standalone components

  imports: [],
  template: `

    <a (click)="resetPage()"  class="logodark" style="cursor: pointer;" aria-hidden="true" data-toggle="tooltip" data-placement="bottom" title="Refresh" data-animation="false">
      <img
        src="https://i.postimg.cc/c4cNmDdV/favicon-32x32.png"
        class="align-middle m-2"
        alt="logo"
      />
  </a>

    <a (click)="resetPage()" class="logolight" style="cursor: pointer;"aria-hidden="true" data-toggle="tooltip" data-placement="bottom" title="Refresh" data-animation="false">
      <img
        src="https://i.postimg.cc/c4cNmDdV/favicon-32x32.png"
        class="align-middle m-2"
        alt="logo"
      />
    </a>

  `,
})
export class BrandingComponent {
  options = this.settings.getOptions();
  constructor(private settings: CoreService, private router : Router,private location: Location) {}
  private isRefreshing = false;

  resetPage() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;

    // Get current navigation details
    const currentUrl = this.router.url;
    const targetUrl = '/dashboards/dashboard1';

    try {
      if (currentUrl === targetUrl) {
        // If already on target page, force reload
        window.location.reload();
      } else {
        // Navigate to target and then reload
        this.router.navigateByUrl(targetUrl, { skipLocationChange: false })
          .then(() => {
            window.location.reload();
          })
          .catch(() => {
            // Fallback if navigation fails
            window.location.href = targetUrl;
          });
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      // Final fallback
      window.location.href = targetUrl;
    } finally {
      setTimeout(() => {
        this.isRefreshing = false;
      }, 1000);
    }
  }
}
