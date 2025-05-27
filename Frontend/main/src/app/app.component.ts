import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginApiService } from './pages/authentication/side-login/login-api.service';
import { FooterComponent } from "./layouts/full/shared/footer/footer.component";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private authService: LoginApiService) {}

  ngOnInit(): void {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    this.authService.setUser(JSON.parse(savedUser));
  }
}
}
