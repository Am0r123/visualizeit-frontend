import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeExplainerComponent } from './code-explainer.component';

describe('CodeExplainerComponent', () => {
  let component: CodeExplainerComponent;
  let fixture: ComponentFixture<CodeExplainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeExplainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeExplainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
