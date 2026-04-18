import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmenityList } from './amenity-list';

describe('AmenityList', () => {
  let component: AmenityList;
  let fixture: ComponentFixture<AmenityList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmenityList],
    }).compileComponents();

    fixture = TestBed.createComponent(AmenityList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
