import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  selectedFile: File | null = null;
  photoUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
        const user = JSON.parse(userString);
        console.log('User from localStorage:', user); // Debugging
        this.profileForm.patchValue(user);
        this.photoUrl = user.photoUrl ? `http://localhost:8080/api/uploads/${user.photoUrl}` : null;
        console.log('Photo URL:', this.photoUrl); // Debugging
    } else {
        console.error('No user found in localStorage');
        this.router.navigate(['/login']);
    }
}
  navigateToMessage() {
    this.router.navigate(['/messages']);  
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    const nameParts = name.trim().split(' ');
    return nameParts.map(part => part.charAt(0).toUpperCase()).join('');
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const userString = localStorage.getItem('user');
  
      if (userString) {
        const userId = JSON.parse(userString).id;
        const { username, email } = this.profileForm.value;
        const photo = this.selectedFile;
  
        this.userService.updateProfile(userId, username, email, photo || undefined).subscribe({
          next: (response) => {
            console.log('Backend Response:', response); // Log the response
  
            // Update the photoUrl with the new photo URL from the response
            if (response.photoUrl) {  
              this.photoUrl = `http://localhost:8080/api/uploads/${response.photoUrl}`;

            }
            
            // Update the profileForm with the new data
            this.profileForm.patchValue({
              username: response.username,
              email: response.email
            });
  
            // Update the user data in localStorage
            localStorage.setItem('user', JSON.stringify(response));
  
            // Navigate to the messages page or show a success message
            this.router.navigate(['/messages']);
          },
          error: (error) => {
            console.error('Error updating profile:', error);
          }
        });
      } else {
        console.error('No user found in localStorage');
        this.router.navigate(['/login']);
      }
    }
  }



  deleteUser() {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userId = JSON.parse(userString).id;

      // Confirm deletion with the user
      const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
      if (confirmDelete) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            console.log('User deleted successfully');

            // Clear localStorage and navigate to the login page
            localStorage.removeItem('user');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Error deleting user:', error);
          }
        });
      }
    } else {
      console.error('No user found in localStorage');
      this.router.navigate(['/login']);
    }
  }
}
