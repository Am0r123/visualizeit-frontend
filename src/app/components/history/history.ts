import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.html',
  styleUrls: ['./history.scss']
})
export class HistoryComponent implements OnInit {
  snippets: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    this.http.get<any[]>(`http://localhost:8080/api/history/${userId}`).subscribe({
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
      this.router.navigate(['/custom'], { state: { code: item.codeContent } });
    } else {
      this.router.navigate(['/levels'], { state: { code: item.codeContent, level: item.title } });
    }
  }
}