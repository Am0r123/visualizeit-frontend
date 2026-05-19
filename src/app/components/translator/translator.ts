import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { TranslatorService } from '../../services/translator/translator.service';

@Component({
  selector: 'app-translator',
  templateUrl: './translator.html',
  styleUrls: ['./translator.scss']
  // Removed standalone: true and imports: [...] here!
})
export class TranslatorComponent {
  
  inputCode: string = '';
  outputCode: string = '';
  errorMessage: string = '';
  
  sourceLang: string = 'detect'; 
  targetLang: string = 'Python'; 
  
  isLoading: boolean = false;
  
  languages = [
    { value: 'Java', label: 'Java' },
    { value: 'Python', label: 'Python' },
    { value: 'C++', label: 'C++' },
    { value: 'C#', label: 'C#' },
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'C', label: 'C' }
  ];

  constructor(
    private translatorService: TranslatorService,
    private toastr: ToastrService
  ) {}

  // 🟢 File Upload Handler
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.inputCode = e.target?.result as string;
        this.toastr.success(`${file.name} loaded successfully!`, 'File Attached');
      };
      reader.onerror = () => {
        this.errorMessage = 'Failed to read the file.';
      };
      reader.readAsText(file);
    }
    // Reset the input so the same file can be selected again if needed
    event.target.value = '';
  }

  translateCode(): void {
    this.errorMessage = ''; 

    // 1. Check Empty
    if (!this.inputCode.trim()) {
      this.errorMessage = 'Please paste some code or upload a file to translate.';
      return;
    }

    // 2. Check Same Language
    if (this.sourceLang !== 'detect' && this.sourceLang === this.targetLang) {
      this.errorMessage = 'Source and Target languages cannot be the same.';
      return;
    }

    // 3. Proceed
    this.isLoading = true;
    this.outputCode = '';

    this.translatorService.translate(this.inputCode, this.sourceLang, this.targetLang)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.outputCode = res.translated_code;
            this.toastr.success(`Converted to ${res.target_language}`, 'Success');
          } else {
            this.errorMessage = res.message || 'Translation Failed';
          }
        },
        error: (err) => {
          console.error(err);
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Server connection failed. Is the backend running?';
          }
        }
      });
  }

  copyToClipboard() {
    if(this.outputCode) {
        navigator.clipboard.writeText(this.outputCode).then(() => {
            this.toastr.info('Copied!', 'Success');
        });
    }
  }
}