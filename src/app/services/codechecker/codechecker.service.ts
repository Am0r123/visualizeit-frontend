import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CodeCheckerService {
  private readonly apiBase = environment.backendUrl;

  constructor(private http: HttpClient) { }
  detectLanguage(code: string): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/api/code/detect`, { code: code });
  }
  verifyCode(code: string,detectedLanguage): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/api/code/verify`, { code: code, language: detectedLanguage });
  }
  execute(code: string, input: any): Observable<any> {
    return this.http.post(`${this.apiBase}/api/code/execute`, {
      code,
      input
    });
  }
  getComplexity(inputCode: string): Observable<any> {
    const object = { code: inputCode, from: 'frontend' };
    return this.http.post<any>(`${this.apiBase}/complexity`, object);
  }
}
