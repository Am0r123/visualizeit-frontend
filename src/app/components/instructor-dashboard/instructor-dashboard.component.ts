import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // ✅ Added for API calls
import { AuthService } from '../../services/auth/auth.service'; 
import { environment } from 'src/environments/environment'; // ✅ Added for your backend URL

@Component({
  selector: 'app-instructor-dashboard',
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['../dashboard/dashboard.scss'] 
})
export class InstructorDashboardComponent implements OnInit {
  
  username: string = ''; 

  // ✅ NEW: Default stats object. This prevents the HTML from crashing 
  // before the database responds.
  stats = {
    totalStudents: 0,
    activeTopics: 0,
    totalLevels: 0,
    totalWeeklyChallenges: 0
  };

  constructor(
    private authService: AuthService,
    private http: HttpClient // ✅ Inject HttpClient
  ) {}

  ngOnInit(): void {
    // 1. Get the instructor's name
    this.username = this.authService.getUsername() || 'Instructor';
    
    // 2. Fetch the live numbers from the database!
    this.loadStats();
  }

  // ✅ NEW: Method to call your InsDashboardController
  loadStats() {
    this.http.get<any>(`${environment.backendUrl}/api/dashboard/stats`).subscribe({
      next: (data) => {
        // Update our default 0s with the real numbers from MySQL!
        this.stats = data; 
      },
      error: (err) => {
        console.error("Failed to load dashboard stats", err);
      }
    });
  }
}