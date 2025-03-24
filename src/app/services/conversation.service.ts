import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface RequestConversationDto {
  isGroup: boolean;
  groupName: string;
  participantIds: number[];
}

interface RespondConversationDto {
  id: number;
  isGroup: boolean;
  groupName: string;
  participants: any[];
  createdAt: string;
}


@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = 'http://localhost:8080/api/conversations';

  constructor(private http: HttpClient) {}

  getUserConversations(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`);
  }
  
  createConversation(conversationData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, conversationData);
  }

  getConversationById(conversationId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/conversations/${conversationId}`);
  }

  deleteConversation(conversationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${conversationId}`);
  }
}
