import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyLicense } from './apply-license';

describe('ApplyLicense', () => {
  let component: ApplyLicense;
  let fixture: ComponentFixture<ApplyLicense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyLicense]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyLicense);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
