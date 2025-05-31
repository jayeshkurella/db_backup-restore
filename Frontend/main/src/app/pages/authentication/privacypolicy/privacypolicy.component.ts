import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PrivacyrouteService } from './privacyroute.service';
import { CoreService } from 'src/app/services/core.service';


@Component({
  selector: 'app-privacypolicy',
  imports: [CommonModule, MatButtonModule, MatListModule, MatIconModule, MatDividerModule],
  templateUrl: './privacypolicy.component.html',
  styleUrl: './privacypolicy.component.scss',
  host: {
    style: 'display: block; width: 100%; height: 100%;'
  }

})
export class PrivacypolicyComponent implements OnInit {
  selectedTab: string = 'privacy';
  currentTheme: string = 'light'; 


  constructor(private router: Router, private previousRouteService: PrivacyrouteService, private coreService: CoreService) { }

  ngOnInit(): void {
    this.currentTheme = this.coreService.getOptions().theme;
    console.log('Privacy Policy - Current Theme:', this.currentTheme);
  }

  agreeAndReturn() {
    localStorage.setItem('userAgreedToPrivacy', 'true');
    this.router.navigate(['/authentication/side-register']);
  }
  disagreeAndReturn() {
    localStorage.setItem('userAgreedToPrivacy', 'false');
    this.router.navigate(['/authentication/side-register']);
  }
  get options() {
    return this.coreService.getOptions();
  }
goBack() {
  this.previousRouteService.goBack('/'); // Optional default route
}
}