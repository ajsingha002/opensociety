import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmenitiesService } from '../amenities.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.html',
  styleUrls: ['./my-bookings.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  isLoading = true;

  constructor(
    private service: AmenitiesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.service.getMyBookings().subscribe({
      next: (data) => {
        // Use spread operator to ensure a new reference for change detection
        this.bookings = [...data]; 
        this.isLoading = false;
        
        // Manually trigger change detection to fix the "blank list" bug
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackByBookingId(index: number, item: any) {
    return item.id;
  }

  cancel(id: string) {
    if (confirm('Cancel this booking?')) {
      this.service.cancelBooking(id).subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (err) => {
          alert('Error cancelling booking: ' + (err.error?.message || err.message));
        }
      });
    }
  }
}