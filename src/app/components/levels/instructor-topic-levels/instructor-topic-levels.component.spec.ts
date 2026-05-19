import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorTopicLevelsComponent } from './instructor-topic-levels.component';

describe('InstructorTopicLevelsComponent', () => {
  let component: InstructorTopicLevelsComponent;
  let fixture: ComponentFixture<InstructorTopicLevelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstructorTopicLevelsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructorTopicLevelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
