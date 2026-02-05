import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LevelsDataService {
  private baseUrl = 'http://localhost:8080/api'; 

  constructor(private http: HttpClient) { }

  // ✅ ADDED THIS: Fetches the list of topics (Arrays, Sorting, etc.)
  getTopics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/topics`);
  }

  // Fetches the specific levels for a topic (e.g., levels/arrays)
  getLevels(topicSlug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/levels/${topicSlug}`);
  }

  // Saves the user's answer
  saveAnswer(userId: number, levelId: number, code: string): Observable<any> {
    const payload = { userId, levelId, code };
    return this.http.post(`${this.baseUrl}/submit`, payload, { responseType: 'text' });
  }
}