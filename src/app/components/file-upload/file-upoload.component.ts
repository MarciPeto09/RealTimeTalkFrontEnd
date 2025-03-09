import { Component, EventEmitter, Output } from '@angular/core';
import { FileUploadService } from '../../services/file-upload.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upoload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upoload.component.html',
  styleUrl: './file-upoload.component.css'
})
export class FileUpoloadComponent {

  selectedFile: File | null = null;
  uploadedFileName: string | null = null;
  fileUrl: string | null = null;
  message: string = '';
  @Output() fileUploaded = new EventEmitter<string>();
  
  constructor(private fileUploadService: FileUploadService) {}

  onFileSelected(event: Event) {  
    const input = event.target as HTMLInputElement;  
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.message = "Please select a file first.";
      return;
    }

    this.fileUploadService.uploadFile(this.selectedFile).subscribe({
      next: (fileName) => {
        this.uploadedFileName = fileName;
        this.fileUrl = this.fileUploadService.getFileUrl(fileName);
        this.message = "File uploaded successfully!";
        this.fileUploaded.emit(fileName); 
      },
      error: () => {
        this.message = "File upload failed.";
      }
    });
  }
}
