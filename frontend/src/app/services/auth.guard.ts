import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { jwtDecode } from 'jwt-decode'; // Import the library

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    try {
      // Decode the token to check the 'exp' field
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if the current time is less than the expiration time
      if (decoded.exp > currentTime) {
        return true; // Token is valid and NOT expired
      } else {
        console.warn('Token has expired. Redirecting to login.');
      }
    } catch (error) {
      console.error('Malformed token. Redirecting to login.', error);
    }
  }

  // If no token or token is expired/invalid, clear storage and redirect
  localStorage.removeItem('token');
  router.navigate(['/login']);
  return false;
};