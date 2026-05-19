import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicSelectorComponent } from './topic-selector.component';

describe('TopicSelectorComponent', () => {
  let component: TopicSelectorComponent;
  let fixture: ComponentFixture<TopicSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopicSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
