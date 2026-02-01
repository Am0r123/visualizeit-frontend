import { Component, Input, OnDestroy } from '@angular/core';
import { CodeCheckerService } from 'src/app/services/codechecker/codechecker.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-array-visualizer',
  templateUrl: './array-visualizer.component.html',
  styleUrls: ['./array-visualizer.component.scss'],
})
export class ArrayVisualizerComponent implements OnDestroy {
  @Input() array: number[] = [];
  @Input() code: string = '';
  @Input() compareMode = false;
  steps: any[] = [];
  percentCorrect: number | null = null;
  errorLines: number[] = [];
  isSorting: boolean = true;
  target: number | null = null;

  detectedLanguage: string | null = null;
  loading = false;
  lastVerify: any = null;
  visualArray: number[] = [4, 1, 9, 7];
  isSortingMode = false;

  private codeUpdate = new Subject<string>();
  private codeSubscription: Subscription;
  isVisualizing = false;

  currentStepIndex = 0;
  interval: any;
  isPlaying = false;
  isPaused = false;
  playSpeed = 500;
  speedMultiplier = 1;

  currentState: any = {
    array: [],
    line: null,
    currentIndex: null,
    compareIndex: null,
    foundIndex: null,
  };
  complexity: string | null = null;

  constructor(
    private CodeCheckerService: CodeCheckerService,
    private router: Router
  ) {
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
    if(this.code.trim().length > 0) 
      this.detectLanguageAndVerify();
  }
  ngOnDestroy() {
    clearInterval(this.interval);
    this.codeSubscription.unsubscribe();
  }

  onCodeChange() {
    this.codeUpdate.next(this.code);
    this.detectLanguageAndVerify();
  }

  detectLanguageAndVerify() {
    this.loading = true;
    this.lastVerify = null;

    this.CodeCheckerService.detectLanguage(this.code).subscribe({
      next: (res) => {
        this.detectedLanguage = res.language;
        this.isSortingMode = this.guessIsSorting(
          this.code,
          this.detectedLanguage
        );
        this.performCodeVerification();
        this.getComplexity();
      },
      error: (err) => {
        console.error('Language detection failed', err);
        this.detectedLanguage = null;
        this.loading = false;
      },
    });
  }

  private performCodeVerification() {
    if (!this.detectedLanguage) {
      this.loading = false;
      return;
    }

    this.CodeCheckerService.verifyCode(
      this.code,
      this.detectedLanguage
    ).subscribe({
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

  verifyAndStartVisualization() {
    // if (
    //   this.lastVerify?.percentCorrect < 50 ||
    //   this.lastVerify?.errors?.length > 0
    // ) {
    //   alert('Your code has issues. Please fix them before visualizing.');
    //   return;
    // }
    if (!this.detectedLanguage || this.code.trim().length === 0) {
      alert(
        'Please paste valid code and wait for language detection/verification.'
      );
      return;
    }

    this.execute();
    this.isVisualizing = true;
  }

  resetVisualization() {
    this.isVisualizing = false;
    this.isPlaying = false;
    this.isPaused = false;
    this.steps = [];
    this.currentStepIndex = 0;
    this.currentState = {
      array: [...this.visualArray],
      line: null,
      currentIndex: null,
      compareIndex: null,
      foundIndex: null,
    };
    clearInterval(this.interval);
  }

  private resetStatus() {
    this.detectedLanguage = null;
    this.lastVerify = null;
    this.errorLines = [];
    this.loading = false;
  }

  execute() {
    this.CodeCheckerService.execute(this.code, this.visualArray).subscribe({
      next: (res) => {
        this.steps = res.steps;
        if (this.steps.length > 0) {
          this.currentState = this.steps[0];
        }
      },
      error: (err) => console.error(err),
    });
  }
  play() {
    if (!this.steps.length) {
      console.warn('No steps to play');
      return;
    }
    this.isPlaying = true;
    this.isPaused = false;
    this.currentStepIndex = 0;
    this.startAnimation();
  }

  startAnimation() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (!this.isPaused && this.currentStepIndex < this.steps.length) {
        this.currentState = this.steps[this.currentStepIndex];
        this.currentStepIndex++;
      } else if (this.currentStepIndex >= this.steps.length) {
        clearInterval(this.interval);
        this.isPlaying = false;
      }
    }, this.playSpeed);
  }

  pause() {
    this.isPaused = true;
  }
  resume() {
    this.isPaused = false;
  }

  changeSpeed(event: any) {
    const value = +event.target.value;
    this.speedMultiplier = value;
    this.playSpeed = 1000 / this.speedMultiplier;

    if (this.isPlaying && !this.isPaused) {
      this.startAnimation();
    }
  }

  nextStep() {
    this.pause();
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.currentState = this.steps[this.currentStepIndex];
    }
  }

  previousStep() {
    this.pause();
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.currentState = this.steps[this.currentStepIndex];
    }
  }
  get maxValue(): number {
    return this.currentState.array && this.currentState.array.length
      ? Math.max(...this.currentState.array)
      : 1;
  }

  onSearchComplete(foundIndex: number) {
    console.log('search complete, found index:', foundIndex);
  }

  private guessIsSorting(code: string, language: string | null): boolean {
    const lower = code.toLowerCase();
    return /sort|swap|bubble|insertion|merge/.test(lower);
  }
  toggleCompare() {
    this.router.navigate(['/compare'], {
      queryParams: {
        leftArray: JSON.stringify(this.array),
        leftCode: this.code,
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
}
