import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      this.router.navigate(['/login']); // Redirect to public page if not logged in
      return false;
    }

    return true;
  }
}
