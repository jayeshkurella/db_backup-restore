import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
  imports: [],
  template: `


    <a href="/dashboards/dashboard1" class="logodark">
  <img
    src="https://i.postimg.cc/c4cNmDdV/favicon-32x32.png"
    class="align-middle m-2"
    alt="logo"
  />
</a>

<a href="/dashboards/dashboard1" class="logolight">
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
  constructor(private settings: CoreService) {}
}
