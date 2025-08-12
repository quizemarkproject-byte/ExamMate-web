import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizResultPage } from './quiz-result-page';

describe('QuizResultPage', () => {
  let component: QuizResultPage;
  let fixture: ComponentFixture<QuizResultPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizResultPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizResultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
