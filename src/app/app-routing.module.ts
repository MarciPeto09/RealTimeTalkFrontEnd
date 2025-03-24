
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { MessagesComponent } from './components/messages/messages.component';
import { NgModule } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FileUpoloadComponent } from './components/file-upload/file-upoload.component';
import { ConversationComponent } from './components/conversation/conversation.component';

export const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'messages', component: MessagesComponent },
    { path: 'sendFile', component: FileUpoloadComponent},
    { path: 'conversation', component: ConversationComponent},
    { path: 'messages/:conversationId', component: MessagesComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
  ];
  
  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {}
