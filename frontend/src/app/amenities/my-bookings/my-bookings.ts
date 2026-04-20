import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AmenitiesService } from '../amenities.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bookings.html',
  styleUrls: ['./my-bookings.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  isLoading = true;
  currentTab: 'upcoming' | 'past' = 'upcoming';

  constructor(
    private service: AmenitiesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadBookings();
  }

  // Logic: Not cancelled AND (Starts now or in the future)
  get upcomingBookings() {
    const now = new Date();
    return this.bookings.filter(b => {
      const startTime = new Date(b.startTime);
      return b.status !== 'CANCELLED' && startTime >= now;
    });
  }

  // Logic: Already cancelled OR (Started in the past)
  get pastBookings() {
    const now = new Date();
    return this.bookings.filter(b => {
      const startTime = new Date(b.startTime);
      return b.status === 'CANCELLED' || startTime < now;
    });
  }

  loadBookings() {
    this.isLoading = true;
    this.service.getMyBookings().subscribe({
      next: (data) => {
        this.bookings = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: 'upcoming' | 'past') {
    this.currentTab = tab;
  }

  trackByBookingId(index: number, item: any) {
    return item.id;
  }

  cancel(id: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
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