import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../core/constants/api-routes';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  signup(userData: any): Observable<any> {
    return this.http.post(API_ROUTES.AUTH.SIGNUP, userData);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(API_ROUTES.AUTH.LOGIN, credentials);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}