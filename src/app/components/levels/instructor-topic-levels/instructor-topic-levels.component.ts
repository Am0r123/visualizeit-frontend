import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LevelsDataService } from '../../../services/levels-data/levels-data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-instructor-topic-levels',
  templateUrl: './instructor-topic-levels.component.html',
  styleUrls: ['./instructor-topic-levels.component.scss']
})
export class InstructorTopicLevelsComponent implements OnInit {
  topicId!: number;
  topicName: string = "Programming Topic"; 
  
  // Grid Data
  levels: any[] = [];
  isLoading = true;

  // Form State
  showAddLevelForm = false;
  isAiMode = true;
  isGenerating = false;

  instructorAiPrompt = '';
  newLevel: any = { title: '', question: '', codeSnippet: '' };

  constructor(
    private route: ActivatedRoute,
    private apiService: LevelsDataService,
    private http: HttpClient // ✅ Added to make direct API calls to your new endpoints
  ) {}

  ngOnInit(): void {
    // Get ID from URL: /instructor/levels/1
    this.route.paramMap.subscribe(params => {
      this.topicId = Number(params.get('id'));
      this.fetchLevels(); // ✅ Fetch levels as soon as the page loads
    });
  }

  // ✅ NEW: Fetch levels from the database
  fetchLevels() {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.backendUrl}/api/levels/topic-id/${this.topicId}`).subscribe({
      next: (data) => {
        this.levels = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch levels', err);
        this.isLoading = false;
      }
    });
  }

  toggleAddForm() { 
    this.showAddLevelForm = !this.showAddLevelForm; 
    // Reset form when opening/closing
    if(!this.showAddLevelForm) {
      this.newLevel = { title: '', question: '', codeSnippet: '' };
      this.isAiMode = true;
    }
  }

  // ✅ NEW: Populate form with existing level data to edit
  editExistingLevel(level: any) {
    this.newLevel = { ...level }; // Copy data to form
    this.showAddLevelForm = true; 
    this.isAiMode = false; // Switch to manual edit mode
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
  }

  // ✅ NEW: Safely delete a level
  deleteLevel(levelId: number) {
    if (confirm("Are you sure you want to delete this level?")) {
      this.http.delete(`${environment.backendUrl}/api/levels/${levelId}`).subscribe({
        next: () => {
          // Remove from screen instantly
          this.levels = this.levels.filter(l => l.id !== levelId);
        },
        error: (err) => console.error('Error deleting level', err)
      });
    }
  }

  generateWithAI() {
    if (!this.instructorAiPrompt.trim()) {
      alert("Please enter a prompt for the AI.");
      return;
    }

    this.isGenerating = true;
    this.apiService.generateLevelWithAI({
      topicName: this.topicName,
      instructorPrompt: this.instructorAiPrompt
    }).subscribe({
      next: (res: any) => {
        try {
          // 1. Clean and Parse JSON
          let data = res;
          if (typeof res === 'string') {
            const cleaned = res.replace(/```json|```/g, '').trim();
            data = JSON.parse(cleaned);
          }
          
          // 2. Map to form fields
          this.newLevel.title = data.title || '';
          this.newLevel.question = data.question || '';
          this.newLevel.codeSnippet = data.codeSnippet || '';
          
          this.isGenerating = false;
          this.isAiMode = false; // Move to review mode
        } catch (e) {
          console.error("Parsing Error:", e, res);
          alert("AI returned invalid JSON. Try a simpler prompt.");
          this.isGenerating = false;
        }
      },
      error: (err) => {
        console.error("AI Generation Error:", err);
        this.isGenerating = false;
        alert("AI failed to generate. Check if Spring Boot is running.");
      }
    });
  }

  saveLevel() {
    if (!this.newLevel.title || !this.newLevel.question) {
      alert("Title and Question are required!");
      return;
    }

    this.apiService.addDynamicLevel(this.topicId, this.newLevel).subscribe({
      next: (response) => {
        alert("✅ Level successfully saved to MySQL!");
        this.showAddLevelForm = false;
        this.newLevel = { title: '', question: '', codeSnippet: '' };
        this.instructorAiPrompt = '';
        this.fetchLevels(); // ✅ Instantly refresh the grid to show the new/edited level!
      },
      error: (err) => {
        console.error("Database Save Error:", err);
        alert("❌ Failed to save to database. Check Spring Boot console.");
      }
    });
  }
}