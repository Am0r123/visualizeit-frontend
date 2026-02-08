import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LevelsDataService } from 'src/app/services/levels-data/levels-data.service'; 

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
  
  // ✅ UI States for AI Feedback
  showSuccess: boolean = false;
  isChecking: boolean = false; 
  feedbackMessage: string = ''; 
  isLoading: boolean = true; 

  constructor(
    private route: ActivatedRoute,
    private levelsDataService: LevelsDataService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.topicId = this.route.snapshot.paramMap.get('id');

    if (this.topicId) {
      this.levelsDataService.getLevels(this.topicId).subscribe({
        next: (data) => {
          this.currentLevels = data;
          this.isLoading = false;
          this.loadProgress();

          const levelToSelect = this.currentLevels.find(l => l.levelNumber === this.unlockedLevel) || this.currentLevels[0];
          this.selectLevel(levelToSelect);
        },
        error: (err) => {
          console.error('Failed to load levels:', err);
          this.isLoading = false;
        }
      });
    }
  }

  loadProgress() {
    const savedProgress = localStorage.getItem(`${this.topicId}_progress`);
    if (savedProgress) {
      this.unlockedLevel = parseInt(savedProgress, 10);
    }
  }

  selectLevel(level: any) {
    if (level.levelNumber > this.unlockedLevel) {
      return; 
    }
    this.selectedLevel = level;
    this.userAnswer = '';
    
    // Reset feedback states
    this.showSuccess = false;
    this.feedbackMessage = '';
  }

  submitAnswer() {
    if (!this.userAnswer.trim() || !this.selectedLevel) { 
      this.toaster.warning("Please type some code first.");
      return;
    }

    // 1. Set Loading State
    this.isChecking = true;
    this.showSuccess = false;
    this.feedbackMessage = "🤖 AI is analyzing your logic...";

    const userId = 1; // Hardcoded for now

    // 2. Call the Backend (AI Check)
    // Make sure your service has 'submitAnswer' (or 'saveAnswer' if you didn't rename it)
    this.levelsDataService.submitAnswer(userId, this.selectedLevel.id, this.userAnswer)
      .subscribe({
        next: (res: any) => {
          this.isChecking = false;

          // 3. Handle AI Response
          if (res.success) {
            // ✅ SUCCESS
            this.showSuccess = true;
            this.feedbackMessage = res.message; // "Correct! Next level unlocked."
            this.toaster.success("Great job! AI verified your code.");

            // Unlock Next Level (Only if we are at the latest unlocked level)
            if (this.selectedLevel.levelNumber === this.unlockedLevel && this.unlockedLevel < this.currentLevels.length) {
              this.unlockedLevel++;
              localStorage.setItem(`${this.topicId}_progress`, this.unlockedLevel.toString());
            }

          } else {
            // ❌ FAIL
            this.showSuccess = false;
            this.feedbackMessage = res.message; // "Incorrect. AI says..."
            this.toaster.error("Incorrect. Check the feedback!");
          }
        },
        error: (err) => {
          this.isChecking = false;
          console.error('Error:', err);
          this.toaster.error("Server error. Could not check code.");
        }
      });
  }

  handleCodeFromChild(code: string) {
    this.userAnswer = code;
  }
}