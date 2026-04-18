// src/app/amenities/amenity-list/amenity-list.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { AmenitiesService } from '../amenities.service';
import { Observable } from 'rxjs'; // 1. Import Observable

@Component({
  selector: 'app-amenity-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [AmenitiesService], // ADD THIS LINE
  templateUrl: './amenity-list.html',
  styleUrls: ['./amenity-list.scss']
})
export class AmenityListComponent implements OnInit {
  // 2. Change the variable to an Observable
  amenities$!: Observable<any[]>;

  constructor(private service: AmenitiesService) {}

  ngOnInit() {
    // 3. Assign the stream directly. No .subscribe() needed here!
    this.amenities$ = this.service.getAmenities();
  }
}