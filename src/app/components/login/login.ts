import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  isLogin = true;
  // ✅ 1. Added ADMIN to the accepted roles
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' = 'STUDENT';

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  // ✅ 2. Updated method signature to accept ADMIN
  selectRole(newRole: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') {
    this.role = newRole;
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
  }

  submit(form: any) {
    if (form.invalid) return;

    if (this.isLogin) {
      this.authService.login(form.value).subscribe({
        next: (res: any) => {
          // 1. Get the official data from the database response
          const dbRole = res.role ? res.role.toUpperCase() : 'STUDENT';
          const userId = res.id; 
          const token = res.token;
          const username = res.username;

          // 🚨 2. STRICT TAB VALIDATION (Now includes Admin) 🚨
          if (this.role !== dbRole) {
            // If the role doesn't match the tab, clear everything and block
            localStorage.clear(); 

            if (dbRole === 'ADMIN') {
              this.toastr.error('This is an Admin account. Please select the Admin tab.', 'Access Denied');
            } else if (dbRole === 'INSTRUCTOR') {
              this.toastr.error('This is an Instructor account. Please select the Instructor tab.', 'Access Denied');
            } else {
              this.toastr.error('This is a Student account. Please select the Student tab.', 'Access Denied');
            }
            return; 
          }

          // 3. SAVE SESSION DATA
          if (userId) {
            localStorage.setItem('userId', userId.toString());
          }
          if (token) {
            localStorage.setItem('token', token);
          }
          if (username) {
            localStorage.setItem('username', username);
          }
          
          localStorage.setItem('role', dbRole);

          this.toastr.success('Welcome back!', 'Login Successful');

          // ✅ 4. Route them dynamically based on confirmed role including ADMIN
          if (dbRole === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (dbRole === 'INSTRUCTOR') {
            this.router.navigate(['/instructor/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Invalid credentials';
          this.toastr.error(errorMsg, 'Login Failed');
        }
      });
    } else {
      this.authService.signup(form.value).subscribe({
        next: (res) => {
          this.toastr.success('Account created! Please log in.', 'Signup Successful');
          this.isLogin = true;
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Could not create account';
          this.toastr.error(errorMsg, 'Signup Failed');
        }
      });
    }
  }
}