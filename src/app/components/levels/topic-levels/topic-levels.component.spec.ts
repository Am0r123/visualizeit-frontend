import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicLevelsComponent } from './topic-levels.component';

describe('TopicLevelsComponent', () => {
  let component: TopicLevelsComponent;
  let fixture: ComponentFixture<TopicLevelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopicLevelsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicLevelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
