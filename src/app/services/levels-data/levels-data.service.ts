import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LevelsDataService {
  private apiUrl = 'http://localhost:8080/api'; // Base URL

  constructor(private http: HttpClient) {}

  getTopics() {
    return this.http.get<any[]>(`${this.apiUrl}/topics`);
  }

  getLevels(topicSlug: string) {
    return this.http.get<any[]>(`${this.apiUrl}/levels/${topicSlug}`);
  }

  // ✅ EXISTING: Submit Code for AI Grading
  submitAnswer(userId: number, levelId: number, code: string): Observable<any> {
    const payload = {
      userId: userId,
      levelId: levelId,
      code: code
    };
    return this.http.post(`${this.apiUrl}/submit`, payload);
  }

  // ==========================================
  // ✅ NEW: INSTRUCTOR APIs
  // ==========================================

  // 1. Call the AI to generate the level JSON
  generateLevelWithAI(requestData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-level`, requestData);
  }

  // 2. Save the final level to the MySQL database
  addDynamicLevel(topicId: number, levelData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/levels/topic/${topicId}/add`, levelData);
  }
}