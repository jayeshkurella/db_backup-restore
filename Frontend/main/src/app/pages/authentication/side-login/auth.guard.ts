import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router); 
  const authToken = localStorage.getItem('authToken');

  if (!authToken) {
    localStorage.setItem('redirectAfterLogin', state.url);
    router.navigate(['/authentication/login']); 
    return false;
  }

  return true; 
};
