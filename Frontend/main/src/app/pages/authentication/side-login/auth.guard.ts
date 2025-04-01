import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router); // Inject Router properly
  const authToken = localStorage.getItem('authToken');

  if (!authToken) {
    router.navigate(['/authentication/login']); // Redirect to login if not authenticated
    return false;
  }

  return true; // Allow access if authenticated
};
