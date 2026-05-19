import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoSolutionsComponent } from './video-solutions.component';

describe('VideoSolutionsComponent', () => {
  let component: VideoSolutionsComponent;
  let fixture: ComponentFixture<VideoSolutionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoSolutionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoSolutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
