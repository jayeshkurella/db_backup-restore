import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacypolicy',
  imports: [MatIcon, MatTabGroup, MatTab],
  templateUrl: './privacypolicy.component.html',
  styleUrl: './privacypolicy.component.scss'
})
export class PrivacypolicyComponent {
  constructor(private router: Router) { }

  agreeAndReturn() {
    localStorage.setItem('userAgreedToPrivacy', 'true');
    this.router.navigate(['/authentication/side-register']);
  }
  disagreeAndReturn() {
    localStorage.setItem('userAgreedToPrivacy', 'false');
    this.router.navigate(['/authentication/side-register']);
  }
}
