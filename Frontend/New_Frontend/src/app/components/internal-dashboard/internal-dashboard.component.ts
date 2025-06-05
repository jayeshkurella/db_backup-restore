import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
declare var  bootstrap :any
import { Collapse } from 'bootstrap';
@Component({
  selector: 'app-internal-dashboard',
  templateUrl: './internal-dashboard.component.html',
  styleUrls: ['./internal-dashboard.component.css']
})
export class InternalDashboardComponent implements AfterViewInit , OnInit {
  userType: string | null = null; // Variable to store user type

  isSidebarOpen = false;
  OpenDropdown: string | null = null;

  isLoading = false;
  openDropdown: string | null = null;


  
 
  constructor(private router : Router){}

  @ViewChild('reportCaseMenu') reportCaseMenu: ElementRef | undefined;

  ngOnInit(): void {
    // Fetch user type from local storage when the component loads
    this.userType = localStorage.getItem('user_type');
  }

  ngAfterViewInit(): void {
      if (this.reportCaseMenu) {
          new Collapse(this.reportCaseMenu.nativeElement, {
              toggle: false 
          });
      }
  }

  // Handle navigation with loading spinner
  onNavigate(): void {
    // this.isLoading = true;
    // setTimeout(() => {
    //   this.isLoading = false;
    //   this.router.navigate(['/Main-dashboard']);
    // }, 3000);
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_id');
    this.router.navigate(['/Main-dashboard']);
    // this.router.navigate(['/login']);
    
  }
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  toggleDropdown(event: Event, dropdownId: string) {
    event.preventDefault(); // Prevents default anchor behavior
    this.openDropdown = this.openDropdown === dropdownId ? null : dropdownId;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
      this.isSidebarOpen = false;
  }









}
