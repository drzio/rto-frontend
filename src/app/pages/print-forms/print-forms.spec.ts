import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintForms } from './print-forms';

describe('PrintForms', () => {
  let component: PrintForms;
  let fixture: ComponentFixture<PrintForms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintForms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintForms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
