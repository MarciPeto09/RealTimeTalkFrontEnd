import { Component } from '@angular/core';
import { UserService, User } from '../../services/user.service'; 
import { NgModel,FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

   user: User = { username: '', email: '', password: '' };
  message = '';

  constructor(private userService: UserService
    , private router: Router 
  ) {}

  navigateToMessage() {
    this.router.navigate(['/messages']);  
  }
  registerUser() {
    this.userService.register(this.user).subscribe({
      next: (response) => {
        this.message = 'Registration successful!';
        console.log(response);

        // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response));
      
        this.router.navigate(['/messages']);  
      },
      error: (error) => {
        this.message = 'Registration failed.';
        console.error(error);
      },
      complete: () => {
        console.log('Registration request completed.');
      }
    });
  }
  

}
