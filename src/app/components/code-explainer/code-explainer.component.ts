import { Component } from '@angular/core';
import { CodeExplainerService } from '../../services/code-explainer/code-explainer.service';

@Component({
  selector: 'app-code-explainer',
  templateUrl: './code-explainer.component.html',
  styleUrls: ['./code-explainer.component.scss']
})
export class CodeExplainerComponent {
  studentCode: string = '';
  explanationResult: string = '';
  isLoading: boolean = false;

  constructor(private explainerService: CodeExplainerService) {}

  submitCode() {
    if (!this.studentCode.trim()) return;

    this.isLoading = true;
    this.explanationResult = '';

    this.explainerService.explainCode(this.studentCode).subscribe({
      next: (res) => {
        this.explanationResult = res.explanation;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching explanation:', err);
        this.explanationResult = 'Failed to get an explanation. Please try again or check your server connection.';
        this.isLoading = false;
      }
    });
  }

  clearAll() {
    this.studentCode = '';
    this.explanationResult = '';
  }
}