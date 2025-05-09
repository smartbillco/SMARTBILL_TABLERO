import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ChatService } from "./chatbot.service";

@Injectable({
  providedIn: "root",
})
export class AudioService {
  private mediaRecorder!: MediaRecorder;
  private audioChunks: BlobPart[] = [];
  private recording = false;

  constructor(private chatService: ChatService) {}

  startRecording(): Promise<void> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.audioChunks = [];

          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.audioChunks.push(event.data);
            }
          };

          this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
            this.uploadAudio(audioBlob);
          };

          this.mediaRecorder.start();
          this.recording = true;
          resolve();
        })
        .catch((error) => {
          console.error("Error al acceder al micrófono", error);
          reject(error);
        });
    });
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.recording) {
      this.mediaRecorder.stop();
      this.recording = false;
    }
  }

  private uploadAudio(audioBlob: Blob): void {
    const file = new File([audioBlob], `audio-${Date.now()}.wav`, {
      type: "audio/wav",
    });

    this.chatService.uploadFile(file, "user").subscribe({
      next: (response) => {
        this.chatService.sendMessage(`📢 Audio enviado`, "user");
        this.chatService.sendMessage(response.message, "bot");
      },
      error: () => {
        this.chatService.sendMessage("❌ Error al subir el audio.", "bot");
      },
    });
  }
}
