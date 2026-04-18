// src/app/amenities/amenities-routing-module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AmenityListComponent } from './amenity-list/amenity-list';
import { BookingFormComponent } from './booking-form/booking-form';
import { MyBookingsComponent } from './my-bookings/my-bookings';

const routes: Routes = [
  { path: '', component: AmenityListComponent },
  { path: 'book/:id', component: BookingFormComponent },
  { path: 'my-bookings', component: MyBookingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AmenitiesRoutingModule {}