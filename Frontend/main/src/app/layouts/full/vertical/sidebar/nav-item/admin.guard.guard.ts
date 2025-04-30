// admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(): boolean {
    const userType = localStorage.getItem('user_type');
    
    if (userType === 'admin') {
      return true;
    }
    
    // Show warning message
    this.showAccessDeniedWarning();
    
    // Redirect to home or access-denied page
    this.router.navigate(['/dashboards/dashboard1']);
    return false;
  }

  private showAccessDeniedWarning(): void {
    this.snackBar.open('You do not have permission to access this page', 'Dismiss', {
      duration: 5000, // 5 seconds
      panelClass: ['error-snackbar'] 
    });
    
    
  }
}