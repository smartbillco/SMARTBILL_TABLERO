import { Component, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { signal } from '@angular/core';


@Component({
  selector: 'app-image-upload-dialog',
  standalone: true,
  imports: [],
  templateUrl: './image-upload-dialog.component.html',
  styleUrl: './image-upload-dialog.component.css'
})
export class ImageUploadDialogComponent implements AfterViewInit {
  selectedFiles: FileList | null = null;
  filename: string = '';
  imageData: SafeResourceUrl | null = null;
  imageSignal = signal(null);

  constructor(private sanitizer: DomSanitizer, private dialogRef: MatDialogRef<ImageUploadDialogComponent>) {}

  ngAfterViewInit() {
    this.openFileDialog(); 
  }

  openFileDialog() {
    const fileInput = document.getElementById('flFile') as HTMLInputElement;
    fileInput.click(); // Simula un clic en el input de archivo
  }

  selectFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selectedFiles = input.files;

    if (this.selectedFiles && this.selectedFiles.length > 0) {
      const file = this.selectedFiles[0];
      this.filename = file.name;

      // Validar si el archivo es una imagen
      const mimeType = file.type;
      if (!mimeType.startsWith('image/')) {
        console.error('El archivo seleccionado no es una imagen:', mimeType);
        alert('Solo se permiten imágenes.');
        return;
      }

      this.convertToBase64(file);
    }
  }

  convertToBase64(data: File) {
    const reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onloadend = () => {
      const base64 = reader.result as string;

      this.dialogRef.close({ base64 });
    };
  }

}