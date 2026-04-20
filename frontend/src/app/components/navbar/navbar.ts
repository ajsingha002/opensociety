import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for *ngIf
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  
  // State for mobile menu
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onLogout(): void {
    this.isMenuOpen = false; // Close menu on logout
    this.authService.logout();
  }
}