import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainVisualizerComponent } from './main-visualizer.component';

describe('MainVisualizerComponent', () => {
  let component: MainVisualizerComponent;
  let fixture: ComponentFixture<MainVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainVisualizerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
