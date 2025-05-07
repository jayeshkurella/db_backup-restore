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

  resetPage() {
    const currentUrl = this.location.path();
    if (currentUrl === '/dashboards/dashboard1') {
      window.location.reload(); // Force full page reload if already on the same page
    } else {
      this.router.navigate(['/dashboards/dashboard1'])
        .then(() => {
          if (this.location.path() === '/dashboards/dashboard1') {
            window.location.reload();
          }
        });
    }
  }
}
