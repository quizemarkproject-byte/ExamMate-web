import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizResultDetail } from './quiz-result-detail';

describe('QuizResultDetail', () => {
  let component: QuizResultDetail;
  let fixture: ComponentFixture<QuizResultDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizResultDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizResultDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
