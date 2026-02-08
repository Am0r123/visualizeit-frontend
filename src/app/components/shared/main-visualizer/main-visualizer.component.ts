import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CodeCheckerService } from 'src/app/services/codechecker/codechecker.service';

@Component({
  selector: 'app-main-visualizer',
  templateUrl: './main-visualizer.component.html',
  styleUrls: ['./main-visualizer.component.scss'],
})
export class MainVisualizerComponent implements OnInit, OnDestroy {
  @Input() initialCode: string | null = null;
  @Input() isCompact: boolean = false;

  // --- Core Data ---
  code: string = '';
  steps: any[] = [];
  
  // --- Visualization State ---
  isVisualizing: boolean = false;
  isPlaying: boolean = false;
  currentStepIndex: number = 0;
  speedMultiplier: number = 1;
  intervalId: any;

  // --- Visualizer Type Handling ---
  currentType: 'ARRAY' | 'TREE' | 'LINKED_LIST' | 'UNKNOWN' = 'UNKNOWN';
  currentData: any = null;
  currentIndices: any = {};
  currentLine: number = -1;

  // --- Verification & Status State (From ArrayVisualizer) ---
  loading: boolean = false;
  detectedLanguage: string | null = null;
  lastVerify: any = null; // Stores percentCorrect, errors
  complexity: string | null = null;
  errorLines: number[] = [];
  
  // --- Backend / Execution Errors ---
  executionError: string | null = null;

  // --- Debounce Logic ---
  private codeUpdate = new Subject<string>();
  private codeSubscription: Subscription;

  constructor(
    private CodeCheckerService: CodeCheckerService,
    private router: Router
  ) {
    // Debounce code changes to avoid spamming the verify API
    this.codeSubscription = this.codeUpdate
      .pipe(debounceTime(5000), distinctUntilChanged())
      .subscribe(() => {
        if (this.code.trim().length > 0) {
          this.detectLanguageAndVerify();
        } else {
          this.resetStatus();
        }
      });
  }

  ngOnInit() {
    if (this.initialCode) {
      this.code = this.initialCode;
      this.detectLanguageAndVerify();
    } else {
      this.code = `# Paste your code here...`;
    }
  }

  ngOnDestroy() {
    this.pause();
    if (this.codeSubscription) {
      this.codeSubscription.unsubscribe();
    }
  }

  // --- Input Handling ---
  onCodeChange() {
    this.codeUpdate.next(this.code);
    // Note: We don't verify immediately; the subscription handles it after 1s
  }

  // --- Detection & Verification (Ported Logic) ---
  detectLanguageAndVerify() {
    this.loading = true;
    this.lastVerify = null;
    this.executionError = null;

    this.CodeCheckerService.detectLanguage(this.code).subscribe({
      next: (res) => {
        this.detectedLanguage = res.language;
        this.performCodeVerification();
        this.getComplexity();
      },
      error: (err) => {
        console.error('Language detection failed', err);
        this.detectedLanguage = 'PYTHON'; // Fallback
        this.loading = false;
      },
    });
  }

  private performCodeVerification() {
    if (!this.detectedLanguage) return;

    this.CodeCheckerService.verifyCode(this.code, this.detectedLanguage).subscribe({
      next: (res) => {
        this.lastVerify = res;
        this.errorLines = (res.errors || []).map((e: any) => e.line);
        this.loading = false;
      },
      error: (err) => {
        console.error('Verification failed', err);
        this.loading = false;
      },
    });
  }

  getComplexity() {
    this.CodeCheckerService.getComplexity(this.code).subscribe({
      next: (res) => {
        this.complexity = res.complexity || '';
      },
      error: (err) => console.error(err),
    });
  }

  private resetStatus() {
    this.detectedLanguage = null;
    this.lastVerify = null;
    this.errorLines = [];
    this.complexity = null;
    this.loading = false;
  }

  // --- Execution (The Run Button) ---
  execute() {
    if (!this.detectedLanguage || this.code.trim().length === 0) {
      alert('Please wait for language detection or enter valid code.');
      return;
    }

    this.loading = true;
    this.executionError = null;
    
    // We use the same service, but pass 0 as visualArray for now 
    // (or update service to accept generic inputs if your backend supports it)
    // Assuming CodeCheckerService.execute is capable of returning the steps for Trees/Lists too
    // If not, revert to your http.post call here.
    
    // Using the Service approach to maintain consistency:
    this.CodeCheckerService.execute(this.code).subscribe({
      next: (res) => {
        this.loading = false;
        
        if (res.error) {
          this.executionError = res.error;
          return;
        }

        this.steps = res.steps || [];
        
        if (res.exception) {
           this.executionError = `${res.exception.type || 'Error'}: ${res.exception.message}`;
           if(res.exception.line) this.errorLines.push(res.exception.line);
        }

        if (this.steps.length > 0) {
          this.isVisualizing = true;
          this.currentStepIndex = 0;
          this.updateState();
        }
      },
      error: (err) => {
        this.loading = false;
        this.executionError = "Failed to connect to backend.";
        console.error(err);
      }
    });
  }

  // --- Playback Controls ---
  reset() {
    this.isVisualizing = false;
    this.pause();
    this.steps = [];
    this.currentStepIndex = 0;
    this.currentData = null;
    this.executionError = null;
    this.currentType = 'UNKNOWN';
  }

  updateState() {
    if (!this.steps || this.steps.length === 0) return;
    if (this.currentStepIndex >= this.steps.length) this.currentStepIndex = this.steps.length - 1;

    const step = this.steps[this.currentStepIndex];
    
    // Update Type (Array, Tree, etc)
    if (step.type && step.type !== 'UNKNOWN') this.currentType = step.type;
    
    // Update Data
    if (step.data !== null && step.data !== undefined) this.currentData = step.data;
    
    // Update Highlighting
    this.currentIndices = step.indices || {};
    this.currentLine = step.line;
  }

  play() {
    if (this.isPlaying) return;
    // Loop if at end
    if (this.currentStepIndex >= this.steps.length - 1) this.currentStepIndex = 0;
    
    this.isPlaying = true;
    this.intervalId = setInterval(() => {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
        this.updateState();
      } else {
        this.pause();
      }
    }, 1000 / this.speedMultiplier);
  }

  pause() {
    this.isPlaying = false;
    clearInterval(this.intervalId);
  }

  stepForward() {
    this.pause();
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.updateState();
    }
  }

  stepBackward() {
    this.pause();
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.updateState();
    }
  }

  toggleCompare() {
    this.router.navigate(['/compare'], { queryParams: { code: this.code } });
  }

  updateSpeed() {
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }
}