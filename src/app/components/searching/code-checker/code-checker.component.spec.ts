import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeCheckerComponent } from './code-checker.component';

describe('CodeCheckerComponent', () => {
  let component: CodeCheckerComponent;
  let fixture: ComponentFixture<CodeCheckerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeCheckerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
