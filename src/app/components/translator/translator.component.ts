import { Component, OnInit } from '@angular/core';
import { TranslatorService } from 'src/app/services/translator/translator.service';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-translator',
  templateUrl: './translator.component.html',
  styleUrls: ['./translator.component.scss']
})
export class TranslatorComponent implements OnInit {
  inputCode: string = '';
  outputCode: string = '';
  isLoading: boolean = false;
  estimatedTimeMs: number = 0;
  translationTimeMs: number | null = null;

  constructor(private translatorservice: TranslatorService,private toastr: ToastrService) {}

  ngOnInit(): void {}

  onInputChange(): void {
    this.calculateEstimatedTime();
  }

  calculateEstimatedTime(): void {
    const lineCount = this.inputCode
      .split('\n')
      .filter(line => line.trim() !== '').length;

    const baseTimePerLine = 500;
    const minTime = 1000;
    const maxTime = 15000;
    const estimated = Math.min(lineCount * baseTimePerLine, maxTime);

    this.estimatedTimeMs = Math.max(estimated, minTime);
  }

  translateCode(): void {
    if (this.isLoading || !this.inputCode.trim()) {
      return;
    }

    this.outputCode = '';
    this.isLoading = true;
    this.translationTimeMs = null;
    this.calculateEstimatedTime();
    const startTime = performance.now();

    this.translatorservice.translate(this.inputCode)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.translationTimeMs = performance.now() - startTime;
        })
      )
      .subscribe({
        next: (res) => {
          this.outputCode = res?.python_code || 'Translation failed to return code.';
          if (res?.python_code) {
            this.toastr.success('Translation completed successfully!', 'Success');
          } else {
            this.toastr.warning('Translation finished, but no output was returned.', 'Warning');
          }
        },
        error: (err) => {
          console.error(err);
          setTimeout(() => {
            this.translationTimeMs = null;
          }, 1);
          this.toastr.error(err?.error?.message, 'Error');
        }
      });
  }
}
