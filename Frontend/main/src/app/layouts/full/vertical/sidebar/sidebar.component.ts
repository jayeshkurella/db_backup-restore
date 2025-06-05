import { Component, EventEmitter, Input, OnInit, Output ,ChangeDetectorRef } from '@angular/core';
import { BrandingComponent } from './branding.component';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { navItems as fullNavItems } from './sidebar-data'; // rename import
import { NavItem } from './nav-item/nav-item';

@Component({
  selector: 'app-sidebar',
  imports: [BrandingComponent, TablerIconsModule, MaterialModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
  constructor(private cd: ChangeDetectorRef) {}
  // 👇 This will override the imported `navItems`
  navItems: NavItem[] = [];

  ngOnInit(): void {
    this.updateNavigation();
    
    // Watch for user type changes
    window.addEventListener('storage', () => {
      this.updateNavigation();
    });
  }

  updateNavigation(): void {
    const userType = localStorage.getItem('user_type')?.toLowerCase().trim();
    console.log('[NAV] Current user type:', userType);
    
    // Create fresh filtered array
    const filtered = this.filterItems([...fullNavItems], userType);
    
    console.log('[NAV] Filtered items:', filtered);
    this.navItems = filtered;
    this.cd.detectChanges(); // Force update
  }

  private filterItems(items: NavItem[], userType?: string): NavItem[] {
    return items.filter(item => {
      // Always show section headers
      if (item.navCap) return true;
      
      // Check permissions
      const hasAccess = !item.condition || item.condition.toLowerCase() === userType;
      
      // Filter children if present
      if (item.children) {
        item.children = this.filterItems(item.children, userType);
        return hasAccess && item.children.length > 0;
      }
      
      return hasAccess;
    });
  }
}

