import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WeeklyChallengeService } from '../../services/weekly-challenge/weekly-challenge.service';

interface StudentRank {
  studentName?: string;
  name?: string;
  timeTaken: string; 
  complexityScore: string; 
  correctness: number; 
  overallRank: number;
  isMe?: boolean;
}

@Component({
  selector: 'app-weekly-challenge',
  templateUrl: './weekly-challenge.html', 
  styleUrls: ['./weekly-challenge.scss']
})
export class WeeklyChallengeComponent implements OnInit, OnDestroy {
  showLeaderboard = false;
  isChallengeStarted = false; // ✅ NEW: Controls the "Start" overlay
  selectedLanguage = 'python'; 
  hasSubmitted = false;
  
  startTime: number = 0;
  timerInterval: any;
  formattedTime: string = '00m 00s';
  
  currentChallenge: any = { 
    title: 'Loading...', 
    description: 'Fetching challenge data...', 
    startingCode: '' 
  };
  
  studentCode: string = '';
  leaderboard: StudentRank[] = [];

  constructor(private challengeService: WeeklyChallengeService) {}

  ngOnInit() {
    this.challengeService.getCurrentChallenge().subscribe({
      next: (data) => {
        this.currentChallenge = data;
        this.studentCode = data.startingCode;
        
        // Check if the user has already submitted to lock the UI immediately
        this.checkExistingSubmission();
        
        // 🛑 startTimer() removed from here so it doesn't auto-run!
      },
      error: () => {
        this.currentChallenge.title = "No Active Challenge";
        this.currentChallenge.description = "Waiting for the instructor to publish a new challenge.";
        this.studentCode = "# No active challenge available.";
      }
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  /**
   * ✅ NEW: Triggered when user clicks the "Start Challenge" button
   */
  onStartChallenge() {
    this.isChallengeStarted = true;
    this.startTimer();
  }

  checkExistingSubmission() {
    const loggedInUser = localStorage.getItem('username');
    if (!loggedInUser) return;

    this.challengeService.getLeaderboard().subscribe({
      next: (data) => {
        const found = data.find(s => s.studentName === loggedInUser || s.name === loggedInUser);
        if (found) {
          this.hasSubmitted = true;
          this.isChallengeStarted = true; // Reveal workspace if already solved
          this.stopTimer();
          this.studentCode = "// 🔒 You have already submitted your solution for this week.";
        }
      }
    });
  }

  startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsedMs = Date.now() - this.startTime;
      this.formattedTime = this.formatTimeDisplay(elapsedMs);
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  formatTimeDisplay(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    const secStr = seconds < 10 ? '0' + seconds : seconds;
    return `${minStr}m ${secStr}s`;
  }

  toggleLeaderboard() {
    this.showLeaderboard = !this.showLeaderboard;
    if (this.showLeaderboard) {
      this.challengeService.getLeaderboard().subscribe({
        next: (data) => {
          const loggedInUser = localStorage.getItem('username') || 'Anonymous Student';
          
          this.leaderboard = data.map(student => {
            const isMe = (student.studentName === loggedInUser || student.name === loggedInUser);
            if (isMe) this.hasSubmitted = true; 
            
            return {
              ...student,
              isMe: isMe
            };
          });
        },
        error: (err) => console.error("Failed to load leaderboard", err)
      });
    }
  }

  submitCode() {
    if (this.hasSubmitted) return; 

    this.stopTimer(); 

    const loggedInUser = localStorage.getItem('username') || 'Anonymous Student';

    const submissionData = {
      studentName: loggedInUser, 
      submittedCode: this.studentCode, 
      timeTaken: this.formattedTime,
      language: this.selectedLanguage 
    };

    this.challengeService.submitStudentCode(submissionData).subscribe({
      next: (response) => {
        alert(`Great job, ${loggedInUser}! Your code is being graded.`);
        this.hasSubmitted = true;
        this.showLeaderboard = true;
        this.toggleLeaderboard(); 
      },
      error: (err) => {
        alert(err.error?.error || "Submission failed.");
        this.startTimer(); 
      }
    });
  }
}