import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Needed for *ngFor, *ngIf, DatePipe

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrls: ['./history.scss']
})
export class HistoryComponent implements OnInit {
  snippets: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Fetch History for user_123 (Replace with actual user ID logic if needed)
    this.http.get<any[]>('http://localhost:8080/api/history/user_123').subscribe({
      next: (data) => {
        this.snippets = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching history:', err);
        this.isLoading = false;
      }
    });
  }

  openCode(item: any) {
    if (item.sourceType === 'CUSTOM') {
      // Navigate to Custom Code page with state
      this.router.navigate(['/custom'], { state: { code: item.codeContent } });
    } else {
      // Navigate to Levels page with state
      this.router.navigate(['/levels'], { state: { code: item.codeContent, level: item.title } });
    }
  }
}