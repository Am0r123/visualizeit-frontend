import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LevelsDataService } from 'src/app/services/levels-data/levels-data.service'; // ✅ Import Service

@Component({
  selector: 'app-levels',
  templateUrl: './levels.component.html',
  styleUrls: ['./levels.component.scss']
})
export class LevelsComponent implements OnInit {

  topics: any[] = [];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private levelsDataService: LevelsDataService // ✅ Inject Service
  ) {}

  ngOnInit(): void {
    // Fetch data from MySQL
    this.levelsDataService.getTopics().subscribe({
      next: (data) => {
        // Map backend data to your UI structure
        this.topics = data.map((topic: any) => {
          return {
            color: '#0f1522', 
            icon: 'assets/images/c-arrays.jpg',
            accent: this.getAccentColor(topic.slug),
            tags: this.getTags(topic.slug)
          };
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading topics:', err);
        this.isLoading = false;
      }
    });
  }

  // Helper to keep your Neon Theme alive
  getAccentColor(slug: string): string {
    switch (slug) {
      case 'arrays': return '#00f2ff';   // Cyan
      case 'sorting': return '#00ff88';  // Green
      case 'searching': return '#bd00ff';// Purple
      default: return '#ffffff';         // White fallback
    }
  }

  // Helper to add tags based on topic
  getTags(slug: string): string[] {
    switch (slug) {
      case 'arrays': return ['CS101', 'Basics'];
      case 'sorting': return ['Algorithms', 'Bubble'];
      case 'searching': return ['Binary', 'Logic'];
      default: return ['General'];
    }
  }

  openTopic(topicSlug: string) {
    console.log('Navigating to:', topicSlug);
    // ⚠️ IMPORTANT: We use 'slug' (e.g., 'arrays') for the URL, not the numeric ID
    this.router.navigate(['/levels', topicSlug]);
  }
}