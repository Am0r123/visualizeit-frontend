import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {
  
  // Make sure this matches your running Spring Boot port
  private readonly apiBase = 'http://localhost:8080'; 

  constructor(private http: HttpClient) { }

  translate(inputCode: string, sourceLang: string, targetLang: string): Observable<any> {
    const payload = { 
        code: inputCode,
        from: sourceLang,
        to: targetLang
    };
    return this.http.post<any>(`${this.apiBase}/translate`, payload);
  }
}