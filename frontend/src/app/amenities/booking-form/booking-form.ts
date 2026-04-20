import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AmenitiesService } from '../amenities.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.scss']
})
export class BookingFormComponent implements OnInit {
  amenity: any = null;
  minDate: string = new Date().toISOString().split('T')[0];
  selectedDate: string = new Date().toISOString().split('T')[0];
  slots: Date[] = [];
  bookedSlots: { startTime: string; endTime: string }[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  // Modal & Selection State
  showModal: boolean = false;
  selectedSlot: Date | null = null;

  constructor(
    private route: ActivatedRoute,
    private service: AmenitiesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getAmenityById(id).subscribe({
        next: (data) => {
          this.amenity = data;
          this.loadSlotsForDate();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to load amenity details.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadSlotsForDate(): void {
    if (!this.amenity?.id) return;

    this.service.getBookedSlots(this.amenity.id, this.selectedDate).subscribe({
      next: (booked) => {
        this.bookedSlots = booked;
        this.generateSlots();
        this.cdr.detectChanges();
      },
      error: () => {
        this.bookedSlots = [];
        this.generateSlots();
        this.cdr.detectChanges();
      }
    });
  }

  generateSlots(): void {
    if (!this.amenity?.config) return;
    this.slots = [];

    const duration = this.amenity.config.slotDuration || 60;
    const now = new Date();

    const startStr = '07:00';
    const endStr = '21:00';
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);

    let current = new Date(this.selectedDate);
    current.setHours(sh, sm, 0, 0);

    const end = new Date(this.selectedDate);
    end.setHours(eh, em, 0, 0);

    while (current < end) {
      // Only push the slot if it is in the future
      if (current.getTime() > now.getTime()) {
        this.slots.push(new Date(current));
      }
      current = new Date(current.getTime() + duration * 60000);
    }
  }

  /**
   * UPDATED: Accepts Date | null to satisfy TypeScript compiler 
   * when called from template with potentially null values.
   */
  isBooked(slot: Date | null): boolean {
    if (!slot) return false;
    return this.bookedSlots.some(
      b => new Date(b.startTime).getTime() === slot.getTime()
    );
  }

  onDateChange(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loadSlotsForDate();
  }

  openConfirmation(slot: Date): void {
    this.selectedSlot = slot;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSlot = null;
  }

  confirmBooking(): void {
    if (!this.selectedSlot || !this.amenity) return;

    const slotToBook = this.selectedSlot;
    this.closeModal();

    this.errorMessage = '';
    this.successMessage = '';

    this.service.bookSlot(this.amenity.id, slotToBook.toISOString()).subscribe({
      next: (res: any) => {
        this.successMessage = res.status === 'PENDING'
          ? 'You have been added to the waitlist for this slot.'
          : 'Booking confirmed!';
        this.loadSlotsForDate();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}