import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  constructor(private router :Router,private cdr: ChangeDetectorRef){}

  ngAfterViewInit() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

 
  

  // Toggle Sidebar: Handles collapsing/expanding
  toggleSidebar() {
    if (!this.isCollapsed) {
      this.isClosing = true;
  
      // Use `keyof` to type the keys properly
      Object.keys(this.isDropdownOpen).forEach((key) => {
        this.isDropdownOpen[key as keyof typeof this.isDropdownOpen] = false;
      });
  
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

  isDropdownOpen: { [key in 'reportCase' | 'searchCase' | 'resources']: boolean } = {
    reportCase: false,
    searchCase: false,
    resources: false,
  };
  
  
  toggleDropdown(menu: 'reportCase' | 'searchCase' | 'resources'): void {
    this.isDropdownOpen = {
      ...this.isDropdownOpen,
      [menu]: !this.isDropdownOpen[menu],
    };
    this.cdr.detectChanges(); // Trigger change detection manually
  }
  
  
  


}
