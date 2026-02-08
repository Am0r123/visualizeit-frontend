import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private readonly apiBase = environment.backendUrl;
  constructor(private http: HttpClient) { }

  runPythonCode(array: number[], code: string) {
    const payload = {
      array: [5, 2, 8, 1],
      code: "for i in range(len(arr)):\n    for j in range(len(arr) - i - 1):\n        if arr[j] > arr[j+1]:\n            arr[j], arr[j+1] = arr[j+1], arr[j]\n        log_step()"
    };
    return this.http.post(`${this.apiBase}/api/python/run`, payload, {
      headers: { 'Content-Type': 'application/json' }
    })
  }

}
