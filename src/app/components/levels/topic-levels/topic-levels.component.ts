import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { LevelsDataService } from 'src/app/services/levels-data/levels-data.service'; 
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-topic-levels',
  templateUrl: './topic-levels.component.html',
  styleUrls: ['./topic-levels.component.scss']
})
export class TopicLevelsComponent implements OnInit {
  topicId: string | null = '';
  selectedLevel: any = null;
  currentLevels: any[] = [];
  
  unlockedLevel: number = 1; 
  userAnswer: string = '';
  
  showSuccess: boolean = false;
  isChecking: boolean = false; 
  feedbackMessage: string = ''; 
  isLoading: boolean = true; 

  constructor(
    private route: ActivatedRoute,
    private levelsDataService: LevelsDataService,
    private http: HttpClient, 
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    // 1. Get IDs from storage and route
    this.topicId = this.route.snapshot.paramMap.get('id');
    const userId = localStorage.getItem('userId');

    // Logging for Omar to debug in the browser console (F12)
    console.log(`Checking Progress for User: ${userId}, Topic: ${this.topicId}`);

    if (this.topicId && userId) {
      this.isLoading = true;
      
      // ✅ Step 1: Fetch Progress from Profiling Table
      this.http.get(`${environment.backendUrl}/api/progress/${userId}/${this.topicId}`)
        .subscribe({
          next: (res: any) => {
            // If res.currentLevel is 3, this.unlockedLevel becomes 3
            this.unlockedLevel = res.currentLevel || 1;
            console.log("DB returned progress:", this.unlockedLevel);
            this.loadLevels();
          },
          error: (err) => {
            console.error("Error fetching progress from DB:", err);
            this.unlockedLevel = 1; // Fallback to level 1
            this.loadLevels();
          }
        });
    } else {
      this.toaster.error("User session not found. Please log in again.");
      this.isLoading = false;
    }
  }

  loadLevels() {
    if (!this.topicId) return;

    this.levelsDataService.getLevels(this.topicId).subscribe({
      next: (data) => {
        // Sort levels by number to be safe
        this.currentLevels = data.sort((a, b) => a.levelNumber - b.levelNumber);
        
        // ✅ Step 2: Sync Sidebar UI
        this.updateLevelsStatus();

        this.isLoading = false;
        
        // ✅ Step 3: Automatically select the highest unlocked level
        const levelToSelect = this.currentLevels.find(l => l.levelNumber === this.unlockedLevel) 
                             || this.currentLevels[0];
        this.selectLevel(levelToSelect);
      },
      error: (err) => {
        console.error('Failed to load levels data:', err);
        this.isLoading = false;
      }
    });
  }

  updateLevelsStatus() {
    this.currentLevels.forEach(level => {
      if (level.levelNumber < this.unlockedLevel) {
        level.status = 'Done';
      } else if (level.levelNumber === this.unlockedLevel) {
        level.status = 'Current';
      } else {
        level.status = 'Locked';
      }
    });
  }

  selectLevel(level: any) {
    // Block selection of locked levels
    if (level.levelNumber > this.unlockedLevel) {
      this.toaster.info(`Level ${level.levelNumber} is locked! Complete Level ${this.unlockedLevel} first.`);
      return; 
    }
    this.selectedLevel = level;
    this.userAnswer = '';
    this.showSuccess = false;
    this.feedbackMessage = '';
  }

  submitAnswer() {
    if (!this.userAnswer.trim() || !this.selectedLevel) { 
      this.toaster.warning("Please type some code first.");
      return;
    }

    this.isChecking = true;
    this.showSuccess = false;
    this.feedbackMessage = "🤖 AI is analyzing your logic...";

    const userId = parseInt(localStorage.getItem('userId') || '0');

    this.levelsDataService.submitAnswer(userId, this.selectedLevel.id, this.userAnswer)
      .subscribe({
        next: (res: any) => {
          this.isChecking = false;

          if (res.success) {
            this.showSuccess = true;
            this.feedbackMessage = res.message; 
            this.toaster.success("Level Complete!");

            // ✅ Step 4: Progress logic
            // Only increment if the user solved their CURRENT highest level
            if (this.selectedLevel.levelNumber === this.unlockedLevel) {
              this.unlockedLevel++;
              this.updateLevelsStatus();
            }

          } else {
            this.showSuccess = false;
            this.feedbackMessage = res.message;
            this.toaster.error("Logic incorrect. Try again!");
          }
        },
        error: (err) => {
          this.isChecking = false;
          this.toaster.error("Submission failed. Check your internet connection.");
        }
      });
  }

  handleCodeFromChild(code: string) {
    this.userAnswer = code;
  }
}