import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmartHintComponent } from './smart-hint'; // <--- FIXED: Correct class name

describe('SmartHintComponent', () => {
  let component: SmartHintComponent;
  let fixture: ComponentFixture<SmartHintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartHintComponent] // <--- FIXED: Use SmartHintComponent
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmartHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});