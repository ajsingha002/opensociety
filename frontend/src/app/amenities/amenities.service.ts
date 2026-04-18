// src/app/amenities/amenities.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class AmenitiesService {
  private readonly API = `${environment.apiUrl}/amenities`;

  constructor(private http: HttpClient) {}

  getAmenities(): Observable<any[]> {
    return this.http.get<any[]>(this.API);
  }

  getAmenityById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`);
  }

  getBookedSlots(amenityId: string, date: string): Observable<{ startTime: string; endTime: string }[]> {
    return this.http.get<{ startTime: string; endTime: string }[]>(
      `${this.API}/${amenityId}/booked-slots?date=${date}`
    );
  }

  bookSlot(amenityId: string, startTime: string): Observable<any> {
    return this.http.post(`${this.API}/${amenityId}/book`, { startTime });
  }

  getMyBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/my-bookings`);
  }

  cancelBooking(id: string): Observable<any> {
    return this.http.delete(`${this.API}/booking/${id}`);
  }
}