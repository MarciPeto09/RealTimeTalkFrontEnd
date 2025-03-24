import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/user';

export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  photoUrl?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}`);
  }

  updateProfile(userId: number, username: string, email: string, photo?: File): Observable<any> {
    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('username', username);
    formData.append('email', email);
  
    if (photo) {
      formData.append('photo', photo);
    }
  
    // Use the correct backend URL
    return this.http.put('http://localhost:8080/api/user/update-profile/' + userId, formData);
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${API_URL}/register`, user);
  }

  login(request: LoginRequest): Observable<User> {
    return this.http.post<User>(`${API_URL}/login`, request);
  }

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${API_URL}/${userId}`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/find/${id}`);
  }
}
