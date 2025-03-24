import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedConversationServiceService {

  private showFormSubject = new Subject<void>();  

  // Observable to notify when the button is clicked
  showForm$ = this.showFormSubject.asObservable();

  // Method to trigger the form display
  showCreateConversationForm() {
    this.showFormSubject.next();
  }
}
