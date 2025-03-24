import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MessageService, Message } from '../../services/message.service';
import { UserService, User } from '../../services/user.service';
import { Router } from '@angular/router';
import { FileUploadService } from '../../services/file-upload.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConversationService } from '../../services/conversation.service';
import { SharedConversationServiceService } from '../../services/shared-conversation-service.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  conversations: any[] = [];
  selectedConversation: any | null = null;
  users: User[] = [];
  currentUser: User | null = null;
  currentUserId: number = 0;
   isUploading: boolean = false;
  photoUrl: string = '';
  newMessage: Message = {
    content: '',
    senderId: 0,
    receiverId: 0,
    fileUrl: '',
    fileName: '',
    timestamp: new Date().toISOString(),
    conversationId: 0  
  };

  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  selectedFile: File | null = null;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private conversationService: ConversationService,
    private fileUploadService: FileUploadService,
    private router: Router,
    private sharedConversationService: SharedConversationServiceService
  ) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.currentUser = JSON.parse(userString);
      this.currentUserId = this.currentUser?.id ?? 0;
      this.currentUser!.photoUrl = 
      user.photoUrl ? `http://localhost:8080/api/uploads/${user.photoUrl.trim()}`
       : 'http://localhost:8080/api/uploads/user.png';
    } else {
      console.error('No user found in localStorage');
    }

    this.userService.getAllUsers().subscribe((users) => {
      this.users = users.filter(user => user.id !== this.currentUserId);
    });

    this.loadConversations();
  }


  deleteConversation(conversationId: number): void {
    if (confirm('Are you sure you want to delete this conversation?')) {
      this.conversationService.deleteConversation(conversationId).subscribe({
        next: () => {
          // Remove the deleted conversation from the list
          this.conversations = this.conversations.filter(
            (conversation) => conversation.id !== conversationId
          );
          alert('Conversation deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting conversation:', error);
          alert('Failed to delete conversation.');
        },
      });
    }
  }
  
  showCreateConversationForm() {
    this.sharedConversationService.showCreateConversationForm();
    this.router.navigate(['/conversation']);
  }

  selectConversation(conversation: any): void {
    console.log('Selecting conversation:', conversation);
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
  }

  loadConversations(): void {
    if (this.currentUserId) {
      this.conversationService.getUserConversations(this.currentUserId).subscribe((data) => {
        this.conversations = data.map((conversation: { participants: any[]; }) => {
          conversation.participants.forEach(participant => {
            participant.photoUrl = participant.photoUrl 
              ? `http://localhost:8080/api/uploads/${participant.photoUrl.trim()}` 
              : 'http://localhost:8080/api/uploads/user.png';
          });
          return conversation;
        });
      });
    } else {
      console.error('Current user ID is missing.');
    }
  }

 
  loadMessages(conversationId: number): void {
    this.messageService.getMessagesByConversation(conversationId).subscribe((messages) => {
      this.messages = messages;
      this.filterMessages();
    });
  }

  filterMessages(): void {
    if (this.selectedConversation) {
      this.filteredMessages = this.messages.filter(
        (msg) => msg.conversationId === this.selectedConversation.id
      );
      this.filteredMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      console.log('Filtered Messages:', this.filteredMessages);
    }
  }

  sendMessage(): void {
    if (!this.selectedConversation) {
      alert('Please select a conversation to send a message.');
      return;
    }
  
    if (this.selectedFile) {
      // Show loading state
      this.isUploading = true;
      
      this.fileUploadService.uploadFile(this.selectedFile).subscribe({
        next: (fileName) => {
          // Construct full URL for the file
          const fileUrl = this.fileUploadService.getFileUrl(fileName);
          
          // Prepare message with file
          const messageWithFile: Message = {
            ...this.newMessage,
            fileName: fileName,
            fileUrl: fileUrl,
            senderId: this.currentUserId,
            conversationId: this.selectedConversation.id,
            timestamp: new Date().toISOString()
          };
  
          // Send the message
          this.messageService.sendMessage(messageWithFile).subscribe({
            next: () => {
              this.loadMessages(this.selectedConversation.id);
              this.resetMessageObject();
              this.isUploading = false;
            },
            error: (err) => {
              console.error('Error sending message:', err);
              this.isUploading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error uploading file:', err);
          this.isUploading = false;
        }
      });
    } else {
      // Send text message only
      this.sendTextMessage();
    }
  }




  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToConversation() {
    this.router.navigate(['/conversation']);
  }
  resetFileInput() {
    // Reset the file input field by setting it to null
    const fileInput: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';  // Clear the file input
    }
  }
  

  sendTextMessage(): void {
  if (!this.selectedConversation) return;

  this.newMessage.senderId = this.currentUserId;
  this.newMessage.conversationId = this.selectedConversation.id;

  this.messageService.sendMessage(this.newMessage).subscribe(() => {
    this.loadMessages(this.selectedConversation.id);
    this.resetMessageObject(); 
  });
}  



  resetMessageObject(): void {
    this.newMessage = {
      content: '',
      senderId: this.currentUserId,
      receiverId: 0,
      fileUrl: '',
      fileName: '',
      timestamp: new Date().toISOString(),
      conversationId: this.selectedConversation ? this.selectedConversation.id : 0
    };
    this.selectedFile = null;
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

  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  getInitials(username: string | undefined): string {
    if (!username) return '';
    return username.split(' ').map((name) => name[0]).join('').toUpperCase();
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

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : 'Unknown User';
  }


  getConversationName(conversation: any): string {
    if (!conversation) return 'No Conversation Selected';
    
    if (conversation.groupName) {
      return conversation.groupName;
    } else if (conversation.participants && conversation.participants.length === 2) {
      // Assuming you want to show the name of the other participant if the conversation is between two users
      return conversation.participants[0]?.name || 'Unnamed Conversation';
    } else {
      return 'Unnamed Conversation';
    }
  }
  

  isImageFile(url: string): boolean {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  }

}
