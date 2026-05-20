import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['../dashboard/dashboard.scss', './admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  username: string = 'Admin'; 
  
  users: any[] = [];
  isLoading = true;
  
  // Dashboard Stats
  stats = {
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalAdmins: 0
  };

  // Form State
  showAddForm = false;
  newUser: any = { username: '', email: '', role: 'STUDENT', password: '' };
  availableRoles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];

  constructor(private http: HttpClient) {
    // Optional: Get real admin name from local storage
    const storedName = localStorage.getItem('username');
    if (storedName) this.username = storedName;
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.backendUrl}/api/admin/users`).subscribe({
      next: (data) => {
        this.users = data;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    this.stats.totalUsers = this.users.length;
    this.stats.totalStudents = this.users.filter(u => u.role === 'STUDENT' || !u.role).length;
    this.stats.totalInstructors = this.users.filter(u => u.role === 'INSTRUCTOR').length;
    this.stats.totalAdmins = this.users.filter(u => u.role === 'ADMIN').length;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) this.resetForm();
  }

  editUser(user: any) {
    this.newUser = { ...user };
    this.showAddForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveUser() {
    if (!this.newUser.username || !this.newUser.role) {
      alert("Username and Role are required!");
      return;
    }

    this.http.post(`${environment.backendUrl}/api/admin/users`, this.newUser).subscribe({
      next: () => {
        alert("User account saved successfully!");
        this.showAddForm = false;
        this.resetForm();
        this.fetchUsers(); // Refresh grid and stats!
      },
      error: (err) => alert("Failed to save user.")
    });
  }

  deleteUser(userId: number) {
    if (confirm("Are you sure you want to delete this user?")) {
      this.http.delete(`${environment.backendUrl}/api/admin/users/${userId}`).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          this.calculateStats(); // Update stats instantly
        },
        error: (err) => alert("Failed to delete user.")
      });
    }
  }

  resetForm() {
    this.newUser = { username: '', email: '', role: 'STUDENT', password: '' };
  }
}