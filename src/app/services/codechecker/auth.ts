import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/login`,
      data,
      { responseType: 'text' }
    );
  }

  signup(data: { username: string; email: string; password: string }): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/signup`,
      data,
      { responseType: 'text' }
    );
  }
}
