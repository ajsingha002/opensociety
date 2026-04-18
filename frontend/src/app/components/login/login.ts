// src/app/components/login/login.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          console.log('Login Response:', res); // CHECK THIS IN CONSOLE
          
          // CRITICAL: Ensure the key matches your Backend (access_token vs token)
          const token = res.access_token || res.token; 
          
          if (token) {
            localStorage.setItem('token', token);
            console.log('Token saved to localStorage');
            this.isSubmitting = false;
            this.router.navigate(['/amenities']);
          } else {
            this.errorMessage = 'Login succeeded but no token was received.';
            this.isSubmitting = false;
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Invalid username or password.';
          this.cdr.detectChanges(); 
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}