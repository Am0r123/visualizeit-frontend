import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.backendUrl}/api/auth`; 

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          
          if (response.id) localStorage.setItem('userId', response.id);
          if (response.username) localStorage.setItem('username', response.username);
          
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    this.router.navigate(['/landing']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); 
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  getUsername(): string | null {
    return localStorage.getItem('username');
  }
}