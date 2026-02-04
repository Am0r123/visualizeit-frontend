import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-smart-hint',
  standalone: true,
  imports: [CommonModule],
  // 🟢 FIX: Ensure these match your actual file names!
  templateUrl: './smart-hint.html',
  styleUrls: ['./smart-hint.scss']
})
export class SmartHintComponent {
  // Input allows parent components to pass code. 
  // Default values provided so it works even if standalone.
  @Input() currentCode: string = 'for(int i=0; i<5; i++) { System.out.printl("Error"); }';
  @Input() currentTopic: string = 'Java Loops';

  hintsLeft: number = parseInt(localStorage.getItem("hintsLeft") || "3");
  showAnimation: boolean = false;
  currentHint: string = '';
  isLoading: boolean = false;

  private apiUrl = 'http://localhost:8080/api/get-smart-hint';

  constructor(private http: HttpClient) {}

  useHint() {
    console.log("💡 Hint Button Clicked!"); // Debug log

    if (this.hintsLeft <= 0 || this.isLoading) {
        console.log("❌ No hints left or loading.");
        return;
    }

    this.isLoading = true;
    this.currentHint = '';

    const payload = { 
      userId: "user_123", 
      topic: this.currentTopic, 
      code: this.currentCode 
    };

    this.http.post<any>(this.apiUrl, payload).subscribe({
      next: (response) => {
        console.log("✅ Backend responded:", response);
        this.isLoading = false;

        if (response.status === 'success') {
          this.hintsLeft = response.hints_left;
          localStorage.setItem("hintsLeft", this.hintsLeft.toString());
          this.currentHint = response.hint;     
          this.triggerAnimation(); 
        } else if (response.status === 'correct') {
           this.currentHint = `<span style="color:#00f2ff">✅ ${response.message}</span>`;
        } else {
          alert("Message from AI: " + response.message);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("❌ API Call Failed:", err);
        alert("Failed to connect to AI. Is Java Backend running?");
      }
    });
  }

  triggerAnimation() {
    this.showAnimation = true;
    setTimeout(() => { this.showAnimation = false; }, 3000); 
  }
}