import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { TranslatorService } from '../../services/translator/translator.service';

@Component({
  selector: 'app-translator',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './translator.html',
  styleUrls: ['./translator.scss']
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

  translateCode(): void {
    this.errorMessage = ''; 

    // 1. Check Empty
    if (!this.inputCode.trim()) {
      this.errorMessage = 'Please paste some code to translate.';
      return;
    }

    // 2. Check Same Language
    if (this.sourceLang !== 'detect' && this.sourceLang === this.targetLang) {
      this.errorMessage = 'Source and Target languages cannot be the same.';
      return;
    }

    // 🟢 3. UNIVERSAL MISMATCH CHECK (Covers All Possibilities)
    if (this.sourceLang !== 'detect') {
      const detected = this.guessLanguage(this.inputCode);
      
      // If we are confident it's a different language
      if (detected !== 'Unknown' && detected !== this.sourceLang) {
        this.errorMessage = `Hold on! You selected ${this.sourceLang}, but this looks like ${detected}.`;
        return; // Stop execution to warn user
      }
    }

    // 4. Proceed
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
          this.errorMessage = 'Server connection failed. Is the backend running?';
        }
      });
  }

  // 🟢 SMART LANGUAGE DETECTOR (Fingerprint Logic)
  guessLanguage(code: string): string {
    const c = code.toLowerCase();

    // --- PYTHON ---
    // Unique: def name():, indentations (hard to check), print "..."
    if (c.includes('def ') && c.includes(':')) return 'Python';
    if (c.includes('import ') && c.includes('from ') && !c.includes(';')) return 'Python';
    if (c.includes('print(') && !c.includes(';')) return 'Python';

    // --- JAVA ---
    // Unique: public class, System.out.println, public static void main
    if (c.includes('public class ') || c.includes('public static void main')) return 'Java';
    if (c.includes('system.out.print')) return 'Java';
    if (c.includes('import java.')) return 'Java';

    // --- C# ---
    // Unique: using System, Console.WriteLine, namespace
    if (c.includes('using system;') || c.includes('console.writeline')) return 'C#';
    if (c.includes('namespace ') && c.includes('{')) return 'C#';

    // --- C++ ---
    // Unique: #include <iostream>, using namespace std, cout, cin, ::
    if (c.includes('#include <iostream>') || c.includes('using namespace std')) return 'C++';
    if (c.includes('std::') || c.includes('cout <<') || c.includes('cin >>')) return 'C++';

    // --- C ---
    // Unique: #include <stdio.h>, printf, scanf (No classes)
    if (c.includes('#include <stdio.h>')) return 'C';
    if (c.includes('printf(') && !c.includes('cout')) return 'C';

    // --- JAVASCRIPT ---
    // Unique: console.log, const/let/var, function name(), =>
    if (c.includes('console.log')) return 'JavaScript';
    if (c.includes('document.getelementbyid') || c.includes('window.')) return 'JavaScript';
    if (c.includes('function ') && !c.includes('public') && !c.includes('void')) return 'JavaScript';
    if ((c.includes('const ') || c.includes('let ')) && c.includes('=>')) return 'JavaScript';

    return 'Unknown'; // If ambiguous, we let it pass
  }

  copyToClipboard() {
    if(this.outputCode) {
        navigator.clipboard.writeText(this.outputCode).then(() => {
            this.toastr.info('Copied!', 'Success');
        });
    }
  }
}