import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LevelsDataService } from 'src/app/services/levels-data/levels-data.service';

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
    private levelsDataService: LevelsDataService
  ) {}

  ngOnInit(): void {
    this.levelsDataService.getTopics().subscribe({
      next: (data) => {
        this.topics = data.map((topic: any) => {
          return {
            // ✅ CRITICAL FIX: Copy all database fields (id, name, title, slug) first!
            ...topic, 
            
            // Then add your UI-specific fields
            color: '#0f1522', 
            accent: this.getAccentColor(topic.slug),
            tags: this.getTags(topic.slug),
            tag: topic.slug
          };
        });
        this.isLoading = false;
        
        // Debug: Check if 'name' or 'title' is actually here now
        console.log('Processed Topics:', this.topics); 
      },
      error: (err) => {
        console.error('Error loading topics:', err);
        this.isLoading = false;
      }
    });
  }

  // ... rest of your helper methods (getAccentColor, getTags, openTopic) stay the same
  getAccentColor(slug: string): string {
    switch (slug) {
      case 'arrays': return '#00f2ff';
      case 'sorting': return '#00ff88';
      case 'searching': return '#bd00ff';
      default: return '#ffffff';
    }
  }

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
    this.router.navigate(['/levels', topicSlug]);
  }
}