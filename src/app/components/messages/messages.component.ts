import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MessageService, Message } from '../../services/message.service';
import { UserService, User } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FileUpoloadComponent } from "../file-upload/file-upoload.component";
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
[x: string]: any;
  
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  sentMessages: Message[] = [];  
  receivedMessages: Message[] = [];  
  users: User[] = [];
  selectedUser: User | null = null;
  newMessage: Message = {
    senderId: 0, receiverId: 0, content: '',
    timestamp: '',
    fileUrl: '',
    fileName: ''
  };
  currentUserId: number = 0;
  currentUser: User | null = null;
  photoUrl: string = '';


  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  selectedFile: File | null = null;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private fileUploadService: FileUploadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.currentUserId = user.id || 0;
      this.currentUser = user;
      this.currentUser!.photoUrl = 
      user.photoUrl ? `http://localhost:8080/api/uploads/${user.photoUrl.trim()}`
       : 'http://localhost:8080/api/uploads/user.png';
      console.log('Current User:', this.currentUser);
    } else {
      console.error('No user found in localStorage');
    }

    this.userService.getAllUsers().subscribe((users) => {
      this.users = users.filter((user) => user.id !== this.currentUserId);
      this.users.forEach((user) => {
        user.photoUrl = user.photoUrl
            ? `http://localhost:8080/api/uploads/${user.photoUrl}`  // Using the correct path for the image
            : 'http://localhost:8080/api/uploads/user.png';  // Default image if no photo URL
    });
      console.log('All Users:', this.users);
    });

    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getAllMessages().subscribe((data) => {
      this.messages = data;
      
      this.filterMessages();
      setTimeout(() => this.scrollToBottom(), 100); // Apply filtering based on selected user
    });
  }

  filterMessages() {
    if (this.selectedUser) {
        // Filter messages between the current user and the selected user
        this.filteredMessages = this.messages.filter(
            (msg) =>
                (msg.senderId === this.currentUserId && msg.receiverId === this.selectedUser?.id) ||
                (msg.senderId === this.selectedUser?.id && msg.receiverId === this.currentUserId)
        );

        // Debugging: Log the messages and their timestamps
        console.log('Filtered Messages:', this.filteredMessages);

        // Sort the filtered messages by timestamp (ascending order)
        this.filteredMessages.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            console.log(`Sorting: ${a.timestamp} -> ${timeA}, ${b.timestamp} -> ${timeB}`);
            return timeA - timeB;
        });

        // Debugging: Log sorted messages
        console.log('Sorted Messages:', this.filteredMessages);

        // Separate the messages into sent and received
        this.sentMessages = this.filteredMessages.filter(msg => msg.senderId === this.currentUserId);
        this.receivedMessages = this.filteredMessages.filter(msg => msg.receiverId === this.currentUserId);

        setTimeout(() => this.scrollToBottom(), 100);
    } else {
        this.filteredMessages = [];
        this.sentMessages = [];
        this.receivedMessages = [];
    }
}


sendMessage() {
  if (!this.selectedUser || this.selectedUser.id === undefined) {
    alert('Please select a valid user to send a message.');
    return;
  }

  if (this.selectedFile) {
    const file = this.selectedFile;
    this.fileUploadService.uploadFile(file).subscribe({
      next: (fileName) => {
        console.log('File uploaded:', fileName);
        this.newMessage.fileUrl = this.fileUploadService.getFileUrl(fileName);
        this.newMessage.fileName = fileName;
        this.sendTextMessage(); 
        this.resetFileInput();
      },
      error: (err) => {
        console.error('File upload failed:', err);
        alert('File upload failed. Please try again.');
      }
    });
  } else {
    this.newMessage.content = this.newMessage.content || ''; 
    this.sendTextMessage();
  }
}



sendTextMessage() {
  this.newMessage.senderId = this.currentUserId;
  this.newMessage.receiverId = this.selectedUser?.id??0;
  
  this.messageService.sendMessage(this.newMessage).subscribe(() => {
    this.loadMessages();  // Ricarica i messaggi
    this.resetMessageObject(); // Resetta il file dopo l'invio
    setTimeout(() => this.scrollToBottom(), 100);
  });
}

resetMessageObject() {
  this.newMessage = {
    content: '',
    senderId: this.currentUserId,
    receiverId: this.selectedUser?.id ?? 0,
    fileUrl: undefined, // Reset fileUrl
    fileName: undefined,
    timestamp: new Date() // Reset fileName
  };
  this.selectedFile = null; // Reset the selected file
}


  selectUser(user: User) {
    this.selectedUser = user;
    this.filterMessages();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  getInitials(username: string | undefined): string {
    if (!username) return '';
    return username.split(' ').map((name) => name[0]).join('').toUpperCase();
  }
  scrollToBottom() {
    const chatBox = document.querySelector('.chat-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }


  triggerFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }
  onFileUpload(fileName: string) {
    console.log("File uploaded:", fileName);
  }
  

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoUrl = e.target.result;
  
        // Update localStorage immediately (temporary before saving)
        const userString = localStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          user.photoUrl = e.target.result; // Store base64 preview
          localStorage.setItem('user', JSON.stringify(user));
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  

resetFileInput() {
  // Reset the file input field by setting it to null
  const fileInput: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';  // Clear the file input
  }
}

deleteMessage(messageId: number | undefined): void {
  if (messageId !== undefined) {
      this.messageService.deleteMessage(messageId).subscribe({
          next: () => {
              this.filteredMessages = this.filteredMessages.filter(msg => msg.id !== messageId);
              this.router.navigate(['/messages']);
          },
          error: (err) => {
              console.error('Error deleting message', err);
              this.router.navigate(['/messages']);
          }
      });
  } else {
      console.warn('Message ID is undefined!');
      this.router.navigate(['/messages']);
  }
}

}