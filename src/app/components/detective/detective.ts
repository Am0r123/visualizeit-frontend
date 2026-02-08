import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detective',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detective.component.html',
  styleUrls: ['./detective.component.scss']
})
export class DetectiveComponent implements OnInit {
  challenges: any[] = [];
  currentChallenge: any = null;
  currentCode: string = '';
  message: string = '';
  lastResult: string = '';
  
  // Dropdown Selections
  selectedStructure: string = 'Array';
  selectedLanguage: string = 'Java';
  selectedDifficulty: string = 'Medium';
  isGenerating: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.http.get<any[]>('http://localhost:8080/api/detective/challenges').subscribe({
        next: (data) => this.challenges = data,
        error: (err) => console.error("Could not fetch cases", err)
    });
  }

  selectChallenge(c: any) {
    this.currentChallenge = c;
    this.currentCode = c.brokenCode;
    this.message = '';
    this.lastResult = '';
  }

  generateCase() {
    this.isGenerating = true;
    this.message = ''; 

    const payload = {
        dataStructure: this.selectedStructure, // Send structure to backend
        difficulty: this.selectedDifficulty,
        language: this.selectedLanguage
    };

    this.http.post<any>('http://localhost:8080/api/detective/generate', payload).subscribe({
      next: (newCase) => {
        this.challenges.unshift(newCase);
        this.selectChallenge(newCase);
        this.isGenerating = false;
      },
      error: () => {
        alert("AI Failed to generate. Backend might be offline.");
        this.isGenerating = false;
      }
    });
  }

  submitCode() {
    if (!this.currentChallenge) return;
    
    this.http.post<any>('http://localhost:8080/api/detective/submit', {
      id: this.currentChallenge.id,
      code: this.currentCode
    }).subscribe(res => {
      this.message = res.message;
      this.lastResult = res.status;
    });
  }
}