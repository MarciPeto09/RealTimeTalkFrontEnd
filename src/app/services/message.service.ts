import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/messages';

export interface Message {
  id?: number;
  senderId: number;
  receiverId: number;
  content: string;
  fileName?: string | null;
  fileUrl?: string| null;
  timestamp: string | Date;
  conversationId: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private http: HttpClient) {}

  getAllMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${API_URL}`);
  }

  getMessagesByConversation(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${API_URL}/conversation/${conversationId}`);
  }

  sendMessage(message: Message, file?: File): Observable<Message> {
    if (file) {
      const formData = new FormData();
      formData.append('senderId', message.senderId.toString());
      formData.append('conversationId', message.conversationId.toString());  
      if (message.content) {
        formData.append('content', message.content);
      }
      if (file) {
        formData.append('file', file, file.name);  
      }
  
      // Send message with file to the backend
      return this.http.post<Message>(`${API_URL}/saveWithFile`, formData);
    } else {
      // Send message without file
      return this.http.post<Message>(`${API_URL}/save`, message);
    }
  }
  

  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${messageId}`);
  }

}
