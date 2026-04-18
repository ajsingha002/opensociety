import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const today = new Date();
    const dob = new Date(control.value);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= minAge ? null : { minAge: { required: minAge, actual: age } };
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  wings = ['A', 'B', 'C', 'D', 'E', 'F'];
  residenceStatuses = ['RESIDING_OWNER', 'TENANT'];
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      dob: ['', [Validators.required, minAgeValidator(13)]],
      residenceStatus: ['RESIDING_OWNER', Validators.required],
      wing: ['', Validators.required],
      flatNumber: [null, [Validators.required, Validators.min(1)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]]
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.cdr.detectChanges();

    if (this.registerForm.valid) {
      const payload = {
        ...this.registerForm.value,
        flatNumber: Number(this.registerForm.value.flatNumber)
      };

      this.authService.signup(payload).subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => {
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
      this.cdr.detectChanges();
    }
  }
}