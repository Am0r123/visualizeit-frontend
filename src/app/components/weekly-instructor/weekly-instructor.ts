import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WeeklyChallengeService } from '../../services/weekly-challenge/weekly-challenge.service'; // Adjust path if needed!

@Component({
  selector: 'app-weekly-instructor',
  templateUrl: './weekly-instructor.html', 
  styleUrls: ['./weekly-instructor.scss']
})
export class WeeklyInstructorComponent implements OnInit {
  challengeTitle = '';
  challengeDescription = '';
  startingCode = '';
  
  leaderboard: any[] = [];
  showLeaderboard = false;
  isPublishing = false; // Controls the button loading state

  constructor(private challengeService: WeeklyChallengeService) {}

  ngOnInit() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.challengeService.getLeaderboard().subscribe({
      next: (data) => this.leaderboard = data,
      error: (err) => console.error("Failed to load leaderboard", err)
    });
  }

  toggleView() {
    this.showLeaderboard = !this.showLeaderboard;
    if (this.showLeaderboard) this.loadLeaderboard();
  }

  publishChallenge() {
    // 1. Validation Check
    if (!this.challengeTitle || !this.challengeDescription) {
      alert("Please enter a Challenge Title and Problem Description before publishing!");
      return;
    }

    // 2. Set button to loading state
    this.isPublishing = true;

    // 3. Build the payload
    const payload = { 
      title: this.challengeTitle, 
      description: this.challengeDescription, 
      startingCode: this.startingCode 
    };

    // 4. Send to backend
    this.challengeService.publishChallenge(payload).subscribe({
      next: () => {
        // Success path
        this.isPublishing = false;
        alert("🚀 Challenge Published Successfully!");
        
        // Clear the form
        this.challengeTitle = ''; 
        this.challengeDescription = ''; 
        this.startingCode = '';
      },
      error: (err) => {
        // Error path
        this.isPublishing = false;
        console.error("Backend Error:", err);
        alert("Failed to publish challenge. Please ensure your backend server is running.");
      }
    });
  }
}