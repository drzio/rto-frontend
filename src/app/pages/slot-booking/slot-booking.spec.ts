import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotBooking } from './slot-booking';

describe('SlotBooking', () => {
  let component: SlotBooking;
  let fixture: ComponentFixture<SlotBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotBooking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
