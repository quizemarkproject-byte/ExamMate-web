import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizResultList } from './quiz-result-list';

describe('QuizResultList', () => {
  let component: QuizResultList;
  let fixture: ComponentFixture<QuizResultList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizResultList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizResultList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
