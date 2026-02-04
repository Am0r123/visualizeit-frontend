import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detective } from './detective';

describe('Detective', () => {
  let component: Detective;
  let fixture: ComponentFixture<Detective>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detective]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Detective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
