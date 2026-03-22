import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesPage } from './services-page';

describe('ServicesPage', () => {
  let component: ServicesPage;
  let fixture: ComponentFixture<ServicesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
