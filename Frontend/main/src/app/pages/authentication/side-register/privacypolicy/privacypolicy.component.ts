import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'app-privacypolicy',
  imports: [CommonModule,MatButtonModule,MatListModule, MatIconModule, MatDividerModule],
  templateUrl: './privacypolicy.component.html',
  styleUrl: './privacypolicy.component.scss',
  host: {
    style: 'display: block; width: 100%; height: 100%;'
  }

})
export class PrivacypolicyComponent {
    selectedTab: string = 'privacy';


  constructor(private router: Router) { }

  agreeAndReturn() {
    localStorage.setItem('userAgreedToPrivacy', 'true');
    this.router.navigate(['/authentication/side-register']);
  }
  disagreeAndReturn() {
    localStorage.setItem('userAgreedToPrivacy', 'false');
    this.router.navigate(['/authentication/side-register']);
  }

  goBack(){
      this.router.navigate(['/']);
  }
}
