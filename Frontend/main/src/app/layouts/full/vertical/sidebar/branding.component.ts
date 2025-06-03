import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from 'src/app/services/core.service';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common'; // Add this for ngStyle

@Component({
  selector: 'app-branding',
  standalone: true, 
  imports: [CommonModule], // Add CommonModule for ngStyle
  template: `
    <div class="branding-container">
      <a (click)="resetPage($event)" class="logodark" style="cursor: pointer;" aria-hidden="true" 
         data-toggle="tooltip" data-placement="bottom"  data-animation="false">
        <img
          src="assets/main-logos/TraceMapr_logo.png"
          [ngStyle]="{'height': logoHeight}"
          class="align-middle m-2"
          alt="logo"
        />
      </a>

      <a (click)="resetPage($event)" class="logolight" style="cursor: pointer;" aria-hidden="true" 
         data-toggle="tooltip" data-placement="bottom"  data-animation="false">
        <img
          src="assets/main-logos/TraceMapr_logo_dark.png"
          [ngStyle]="{'height': logoHeight}"
          class="align-middle m-2"
          alt="logo"
        />
      </a>
    </div>
  `,
  styles: [`
    .branding-container {
      display: flex;
      align-items: center;
    }
    img {
      max-height: 40px;
      margin-left:17px !important;
      width: auto;
      object-fit: contain;
    }
  `]
})
export class BrandingComponent {
  options = this.settings.getOptions();
  logoHeight = '30px'; 

  constructor(private settings: CoreService, private router: Router, private location: Location) {}

  resetPage(event: Event) {
    event.preventDefault();
    const currentUrl = this.location.path();

    if (currentUrl === '/') {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/']);
      });
    } else {
      this.router.navigate(['/']);
    }
  }
}