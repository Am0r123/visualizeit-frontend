import { Component } from '@angular/core';
import { CodeCheckerService } from 'src/app/services/codechecker/codechecker.service';

@Component({
  selector: 'app-code-checker',
  templateUrl: './code-checker.component.html',
  styleUrls: ['./code-checker.component.scss']
})
export class CodeCheckerComponent {
  code: string = '';
  detectedLanguage: string | null = null;
  loading = false;
  lastVerify: any = null;
  errorLines: number[] = [];
  visualArray: number[] = [4,1,9,7]; // example array; you can make dynamic
  isSortingMode = false; // set based on detected language or user choice
  searchTarget: number | null = null;
  steps: any[] = [];

  constructor(private CodeCheckerService: CodeCheckerService) {}

  detectLanguage() {
    this.loading = true;
    this.detectedLanguage = null;
    this.CodeCheckerService.detectLanguage(this.code).subscribe({
      next: res => {
        this.detectedLanguage = res.language;
        // guess mode from language & code content
        this.isSortingMode = this.guessIsSorting(this.code, this.detectedLanguage);
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

verifyCode() {
  this.loading = true;

  this.CodeCheckerService.verifyCode(this.code, this.detectedLanguage)
    .subscribe({
      next: res => {
        this.lastVerify = res;

        this.errorLines = (res.errors || []).map((e:any) => e.line);

        // Prevent visualization if code is clearly invalid
        if (res.percentCorrect < 50 || res.errors?.length > 0) {
          alert("Your code has issues. Please fix them before visualizing.");
          this.loading = false;
          return;
        }

        this.execute();
        this.loading = false;
      }
    });
}


  execute() {
    this.CodeCheckerService.execute(this.code, this.visualArray).subscribe({
      next: (res) => {
        this.steps = res.steps;
      },
      error: (err) => console.error(err)
    })
  }

  onSearchComplete(foundIndex:number) {
    console.log('search complete, found index:', foundIndex);
  }

  private guessIsSorting(code: string, language: string | null) : boolean {
    // simple heuristic: look for "sort" or "swap" or "bubble" keywords
    const lower = code.toLowerCase();
    return /sort|swap|bubble|insertion|merge/.test(lower);
  }
}
