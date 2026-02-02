import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  isLogin = true;
  message = '';

  constructor(private authService: AuthService) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.message = '';
  }

  submit(form: any) {
    if (form.invalid) return;

    if (this.isLogin) {
      this.authService.login(form.value).subscribe({
        next: (res) => {
          this.message = res;
          console.log('Login success:', res);
        },
        error: (err) => {
          this.message = err.error || 'Login failed';
        }
      });
    } else {
      this.authService.signup(form.value).subscribe({
        next: (res) => {
          this.message = res;
          console.log('Signup success:', res);
          this.isLogin = true;
        },
        error: (err) => {
          this.message = err.error || 'Signup failed';
        }
      });
    }
  }
}
