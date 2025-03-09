import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  navigateToRegister() {
    this.router.navigate(['/register']);  
  }
  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    const loginData = this.loginForm.value;

    this.http.post<any>('http://localhost:8080/api/user/login', loginData).subscribe({
      next: (response) => {
         
        localStorage.setItem('user', JSON.stringify(response));

         
        this.router.navigate(['/messages']);
      },
      error: (error) => {
        this.errorMessage = 'Invalid username or password!';
      }
    });
  }
}