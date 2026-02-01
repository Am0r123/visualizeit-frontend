import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrayVisualizerComponent } from './array-visualizer.component';

describe('ArrayVisualizerComponent', () => {
  let component: ArrayVisualizerComponent;
  let fixture: ComponentFixture<ArrayVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArrayVisualizerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArrayVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
