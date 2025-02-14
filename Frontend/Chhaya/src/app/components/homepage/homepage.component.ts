import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
declare var  bootstrap :any
import { Collapse } from 'bootstrap';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements AfterViewInit{

  isSidebarOpen = false;
  OpenDropdown: string | null = null;

  isLoading = false;
  openDropdown: string | null = null;


 
  constructor(private router : Router){}

  @ViewChild('reportCaseMenu') reportCaseMenu: ElementRef | undefined;

  ngAfterViewInit(): void {
      if (this.reportCaseMenu) {
          new Collapse(this.reportCaseMenu.nativeElement, {
              toggle: false // Prevent initial toggle
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
    this.router.navigate(['/Main-dashboard']);
    
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
