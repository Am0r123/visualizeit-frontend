import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyInstructorComponent } from './weekly-instructor';

describe('WeeklyInstructorComponent', () => {
  let component: WeeklyInstructorComponent;
  let fixture: ComponentFixture<WeeklyInstructorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WeeklyInstructorComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeeklyInstructorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
