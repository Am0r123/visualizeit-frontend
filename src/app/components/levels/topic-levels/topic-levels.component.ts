import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  showSuccess: boolean = false;
  isLoading: boolean = true; 

  constructor(
    private route: ActivatedRoute,
    private levelsDataService: LevelsDataService // ✅ Inject Service
  ) {}

  ngOnInit(): void {
    this.topicId = this.route.snapshot.paramMap.get('id');

    if (this.topicId) {
      // ✅ CALL BACKEND INSTEAD OF LOCAL ARRAY
      this.levelsDataService.getLevels(this.topicId).subscribe({
        next: (data) => {
          this.currentLevels = data;
          this.isLoading = false;
          this.loadProgress();

          // Select the highest unlocked level automatically
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
    this.showSuccess = false;
  }

  submitAnswer() {
    if (this.userAnswer.trim().length > 0 && this.selectedLevel) { 
      
      this.showSuccess = true;

      // Unlock Next Level locally
      if (this.selectedLevel.levelNumber === this.unlockedLevel && this.unlockedLevel < this.currentLevels.length) {
        this.unlockedLevel++;
        localStorage.setItem(`${this.topicId}_progress`, this.unlockedLevel.toString());
      }

      // ✅ SAVE ANSWER TO DATABASE
      const userId = 1; 
      this.levelsDataService.saveAnswer(userId, this.selectedLevel.id, this.userAnswer)
        .subscribe({
          next: (res) => console.log('Saved:', res),
          error: (err) => console.error('Error:', err)
        });

    } else {
      alert("Please enter a valid answer.");
    }
  }
}