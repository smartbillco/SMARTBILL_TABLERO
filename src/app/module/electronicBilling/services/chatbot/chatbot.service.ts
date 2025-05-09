import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { JwtHelperService } from "@auth0/angular-jwt";
import { format } from "date-fns";
import { ChatbotMessage } from "../../model/chatbot.model";
import { environment } from "../../../../../environments/environment";
import { AuthService } from "./../../../../pages/service/auth.service";
import { UserService } from "../../../../module/user-management/service/user.service";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private messagesSubject = new BehaviorSubject<ChatbotMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();
  private apiUrl = `${environment.HOST_DATOS}/chatbots`;
  private fileUploadUrl = `${environment.HOST_DATOS}/chatbots/upload`;
  private userPhotoUrl = "";
  private botPhotoUrl = "assets/img/user/user-1.jpg";

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.loadUserPhoto();
    this.initChat();
  }

  private initChat(): void {
    this.messagesSubject.next([
      this.createMessage(
        "bot",
        "Bienvenido. ¿Desea subir una factura o necesita asistencia con otra consulta?"
      ),
    ]);
  }

  sendMessage(text: string, sender: "user" | "bot"): void {
    const newMessage = this.createMessage(sender, text);
    this.addMessage(newMessage);

    if (sender === "user") {
      this.sendToBackend(newMessage).subscribe({
        next: (response) => {
          if (response?.data?.text) {
            this.sendToBot(response.data.text);
          } else {
            this.sendToBot("⚠️ No recibí una respuesta válida del servidor.");
          }
        },
        error: () => {
          this.sendToBot(
            "Hubo un error al procesar tu solicitud. Intenta nuevamente."
          );
        },
      });
    }
  }

  uploadFile(file: File, userName: string): Observable<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userName", userName);

    return this.http.post(this.fileUploadUrl, formData).pipe(
      catchError((error) => {
        console.error("Error al subir el archivo", error);
        return throwError(() => error);
      })
    );
  }

  uploadAudio(audioBlob: Blob): void {
    const file = new File([audioBlob], `audio-${Date.now()}.wav`, {
      type: "audio/wav",
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userName", this.getUserName());

    this.http.post<any>(this.fileUploadUrl, formData).subscribe({
      next: (response) => {
        const audioUrl = response.audioUrl;
        const audioMessage = this.createMessage("user", `📢 Audio enviado`);
        audioMessage.audioUrl = audioUrl;
        this.addMessage(audioMessage);
        this.sendMessage(
          response.message || "🔊 Audio recibido y procesado",
          "bot"
        );
      },
      error: () => {
        this.sendMessage("❌ Error al subir el audio.", "bot");
      },
    });
  }

  private sendToBot(text: string): void {
    this.addMessage(this.createMessage("bot", text));
  }

  private sendToBackend(message: ChatbotMessage): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, this.formatMessage(message), {
        headers: new HttpHeaders({ "Content-Type": "application/json" }),
      })
      .pipe(catchError((error) => throwError(() => error)));
  }

  private createMessage(sender: "user" | "bot", text: string): ChatbotMessage {
    const photoUrl = sender === "user" ? this.userPhotoUrl : this.botPhotoUrl;
    return {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date().toISOString(),
      userName: this.getUserName(),
      userPhoto: photoUrl,
    };
  }

  private addMessage(message: ChatbotMessage): void {
    this.messagesSubject.next([...this.messagesSubject.value, message]);
  }

  private getUserName(): string {
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    return token ? new JwtHelperService().decodeToken(token)?.sub || "" : "";
  }

  private loadUserPhoto(): void {
    const username = this.getUserName();
    if (!username) {
      console.warn("⚠️ No hay usuario autenticado. Usando imagen por defecto.");
      return;
    }

    if (username) {
      this.userService
        .getUserByUsername(username)
        .pipe(
          tap((response) => {
            if (response?.success && response?.data?.photo_url) {
              this.userPhotoUrl = response.data.photo_url;
            } else {
              console.warn(
                "⚠️ No se encontró la foto del usuario en BD. Usando imagen por defecto."
              );
              this.userPhotoUrl = "assets/img/user/user-1.jpg"; 
            }
          })
        )
        .subscribe();
    }
  }

  private formatMessage(message: ChatbotMessage): ChatbotMessage {
    return {
      ...message,
      timestamp: format(new Date(message.timestamp), "yyyy-MM-dd HH:mm:ss"),
    };
  }
}
