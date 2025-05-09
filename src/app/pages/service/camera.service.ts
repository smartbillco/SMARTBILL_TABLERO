import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private videoStream!: MediaStream;

  constructor() { }

  startCamera(videoElement: HTMLVideoElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            this.videoStream = stream;
            videoElement.srcObject = stream;
            resolve();
          })
          .catch((err) => {
            console.error('Error al acceder a la cámara: ', err);
            reject(err);
          });
      } else {
        reject('Tu navegador no soporta acceso a la cámara');
      }
    });
  }

  captureImage(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): string {
    const context = canvasElement.getContext('2d')!;
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);

    // Devolver la imagen en formato base64
    return canvasElement.toDataURL('image/png');
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
    }
  }
}