import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateChattingComponent } from './private-chatting.component';

describe('PrivateChattingComponent', () => {
  let component: PrivateChattingComponent;
  let fixture: ComponentFixture<PrivateChattingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivateChattingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateChattingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
