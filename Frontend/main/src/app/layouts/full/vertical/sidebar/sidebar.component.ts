import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  // 👇 This will override the imported `navItems`
  navItems: NavItem[] = [];

  ngOnInit(): void {
    const userType = localStorage.getItem('user_type');
    console.log('Current user_type:', userType);

    this.navItems = this.filterNavItemsByUserType(fullNavItems, userType);
  }

  filterNavItemsByUserType(items: NavItem[], userType: string | null): NavItem[] {
    return items
      .filter(item => {
        const allow = !item.condition || item.condition === userType;
        if (!allow) {
          console.log(`❌ Hiding: ${item.displayName} for user_type: ${userType}`);
        }
        return allow;
      })
      .map(item => ({
        ...item,
        children: item.children
          ? this.filterNavItemsByUserType(item.children, userType)
          : undefined,
      }));
  }
}
