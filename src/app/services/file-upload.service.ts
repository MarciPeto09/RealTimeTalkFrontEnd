import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:8080/api';  

  
  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<string> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/upload`, formData, { responseType: 'text' });
  }

  getFileUrl(fileName: string): string {
    return `${this.baseUrl}/uploads/${fileName}`;
  } 
}

