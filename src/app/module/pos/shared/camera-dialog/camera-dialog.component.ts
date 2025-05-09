import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button'; 
import { CommonModule } from '@angular/common'; 
import { CameraService } from '../../../../pages/service/camera.service';

@Component({
  selector: 'app-camera-dialog',
  standalone: true, 
  templateUrl: './camera-dialog.component.html',
  styleUrls: ['./camera-dialog.component.css'],
  imports: [CommonModule, MatButtonModule] 
})
export class CameraDialogComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('canvasElement') canvasElement!: ElementRef;
  
  constructor(
    private cameraService: CameraService,
    private dialogRef: MatDialogRef<CameraDialogComponent>
  ) {}

  ngAfterViewInit() {
    this.startCamera();
  }

  startCamera() {
    const video = this.videoElement.nativeElement;
    this.cameraService.startCamera(video).catch(err => {
      console.error('Error al iniciar la cámara: ', err);
    });
  }

  captureImage() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    
    const image = this.cameraService.captureImage(video, canvas);
    //console.log(image);  //  enviar la imagen al servidor 

    this.stopCamera();

    // Cierra el modal y devuelve la imagen capturada
    this.dialogRef.close(image);
  }

  stopCamera() {
    this.cameraService.stopCamera();
  }

  closeDialog() {
    this.stopCamera(); 
    this.dialogRef.close(); 
  }
}