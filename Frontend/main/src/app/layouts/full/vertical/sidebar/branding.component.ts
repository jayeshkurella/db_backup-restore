import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from 'src/app/services/core.service';
import { Location } from '@angular/common'; // Add this import

@Component({
  selector: 'app-branding',
  standalone: true, 
  imports: [],
   template: `
    <a (click)="resetPage($event)" class="logodark" style="cursor: pointer;" aria-hidden="true" 
       data-toggle="tooltip" data-placement="bottom" title="Refresh" data-animation="false">
      <img
        src="https://i.postimg.cc/c4cNmDdV/favicon-32x32.png"
        class="align-middle m-2"
        alt="logo"
      />
    </a>

    <a (click)="resetPage($event)" class="logolight" style="cursor: pointer;" aria-hidden="true" 
       data-toggle="tooltip" data-placement="bottom" title="Refresh" data-animation="false">
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
