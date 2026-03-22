import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMobile } from './update-mobile';

describe('UpdateMobile', () => {
  let component: UpdateMobile;
  let fixture: ComponentFixture<UpdateMobile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateMobile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateMobile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
