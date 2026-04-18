// src/app/amenities/amenities-module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmenitiesRoutingModule } from './amenities-routing-module';
import { AmenitiesService } from './amenities.service';
import { AmenityListComponent } from './amenity-list/amenity-list';
import { BookingFormComponent } from './booking-form/booking-form';
import { MyBookingsComponent } from './my-bookings/my-bookings';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AmenitiesRoutingModule,
    // Since components are Standalone, they go in imports, NOT declarations
    AmenityListComponent,
    BookingFormComponent,
    MyBookingsComponent
  ],
  providers: [AmenitiesService]
})
export class AmenitiesModule {}