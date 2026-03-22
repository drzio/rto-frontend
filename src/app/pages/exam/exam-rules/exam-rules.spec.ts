import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamRules } from './exam-rules';

describe('ExamRules', () => {
  let component: ExamRules;
  let fixture: ComponentFixture<ExamRules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamRules]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamRules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
