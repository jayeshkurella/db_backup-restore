import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
declare var  bootstrap :any
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements  AfterViewInit{

  
 
  isCollapsed: boolean = false;
  isClosing: boolean = false;
  activeIndex: number = -1; 

  constructor(private router :Router){}

  ngAfterViewInit() {
    
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Example sidebar links with titles and SVG paths
  sidebarLinks = [
    { title: 'Search Person', url: '/search', icon: 'bi-search', paths: ['M9 12c0 2.5...'] },
    { title: 'Missing Person', url: '/missing', icon: 'bi-person', paths: ['M9 12c0 2.5...'] },
    { title: 'Unidentified Person', url: '/unidentified', icon: 'bi-person-fill', paths: ['M9 12c0 2.5...'] },
    { title: 'Unidentified Bodies', url: '/unidentified-bodies', icon: 'bi-question-circle', paths: ['M9 12c0 2.5...'] },
    { title: 'Volunteers', url: '/volunteers', icon: 'bi-person-fill', paths: ['M9 12c0 2.5...'] },
    { title: 'Police Stations', url: '/police-stations', icon: 'bi-house-door', paths: ['M9 12c0 2.5...'] },
    { title: 'Hospitals', url: '/hospitals', icon: 'bi-hospital', paths: ['M9 12c0 2.5...'] },
    { title: 'Reports', url: '/reports', icon: 'bi-file-earmark-text', paths: ['M9 12c0 2.5...'] },
  ];
  

  // Toggle Sidebar: Handles collapsing/expanding
  toggleSidebar() {
    if (!this.isCollapsed) {
      this.isClosing = true;
      setTimeout(() => {
        this.isCollapsed = true;
        this.isClosing = false;
      }, 200); 
    } else {
      this.isCollapsed = false;
    }
  }
 

  isLoading = false;

  onNavigate(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false; 
      this.router.navigate(['/Main-dashboard']); 
    }, 3000); 
  }
 


}
