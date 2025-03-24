import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { User } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { ConversationService } from '../../services/conversation.service';
import { MessageService } from '../../services/message.service';
import { CommonModule } from '@angular/common';
import { SharedConversationServiceService } from '../../services/shared-conversation-service.service';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {
  conversations: any[] = [];
  users: User[] = [];
  currentUser: User | null = null;
  currentUserId: number = 0;
  photoUrl: string = '';
  newConversation: any = {
    groupName: '',
    participants: [] as User[] 
  };
  showNewConversationForm: boolean = true;

  constructor(
    private conversationService: ConversationService,
    private userService: UserService,
    private router: Router,
    private sharedConversationService: SharedConversationServiceService
  ) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.currentUser = user;
      this.currentUserId = user.id;
      this.loadConversations();
      this.photoUrl = user.photoUrl ? `http://localhost:8080/api/uploads/${user.photoUrl.trim()}` : 'http://localhost:8080/api/uploads/user.png';
    } else {
      console.error('No user found in localStorage');
    }

    this.sharedConversationService.showForm$.subscribe(() => {
      this.showNewConversationForm = true;
    });

    // Load users except for the current user
    this.userService.getAllUsers().subscribe((users) => {
      this.users = users.filter(user => user.id !== this.currentUser?.id);
    });
  }

  loadConversations(): void {
    if (this.currentUserId > 0) { 
      this.conversationService.getUserConversations(this.currentUserId).subscribe({
        next: (data) => {
          this.conversations = data;
        },
        error: (error) => {
          console.error('Error fetching conversations:', error);
        }
      });
    } else {
      console.error('Current user ID is missing or invalid.');
    }
  }

  selectConversation(conversation: any): void {
    this.router.navigate([`/messages/${conversation.id}`]);
  }

  showCreateConversationForm(): void {
    this.showNewConversationForm = true;
  }

  cancelNewConversation(): void {
    this.showNewConversationForm = false;
    this.newConversation = { groupName: '', participants: [] };
    this.router.navigate(['/messages'])
  }

  createConversation(): void {
    if (!this.currentUser) {
      console.error('No user logged in.');
      return;
    }
  
    const participantIds = [
      this.currentUser.id,
      ...(this.newConversation?.participants || []).map((p: any) => p.id)
    ].filter(id => id);
  
    console.log('Selected participant IDs:', participantIds);

    if (participantIds.length === 0) {
      console.error('Error: No participant IDs found.');
      return;
    }


    const isGroup = participantIds.length > 2;
    const groupName = isGroup 
    ? this.newConversation.groupName 
    : this.users.find(user => user.id === participantIds[1])?.username;
    
    const conversationData = {
      isGroup: participantIds.length > 2,
      groupName: groupName,
      participantIds: participantIds, 
    };
  
    this.conversationService.createConversation(conversationData).subscribe({
      next: (conversation) => {
        this.conversations.push(conversation);
        this.cancelNewConversation();
        this.router.navigate(['/messages', conversation.id]);
      },
      error: (error) => {
        console.error('Error creating conversation:', error);
      }
    });
  }

  getParticipants(conversation: any): string {
    return conversation.participants.map((p: { name: any; }) => p.name).join(', ');
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
}
