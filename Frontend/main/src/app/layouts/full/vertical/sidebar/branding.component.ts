import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
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
  constructor(private settings: CoreService, private router : Router) {}

  resetPage() {
    this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
      this.router.navigate(['/chhaya_web/dashboards/dashboard1']));
  }
}
