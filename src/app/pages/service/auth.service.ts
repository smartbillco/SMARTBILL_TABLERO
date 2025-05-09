import { inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from "@angular/fire/auth";
import { Observable } from "rxjs";

import { User } from "../../module/user-management/model/user";
import { environment } from "../../../environments/environment";

// Interfaces para tipar las respuestas
interface ILoginRequest {
  username: string;
  password: string;
}

interface IGoogleRequest {
  token: string;
}

export interface PasswordResetRequestDTO {
  username: string;
  number?: string; // Opcional dependiendo si lo necesitas para enviar OTP
  onetimepassword?: string;
  newPassword?: string;
}

export interface PasswordResetResponseDTO {
  status: string;
  message: string;
}

export interface ValidOtpDTO {
  valid: boolean;
  message: string;
  token?: string; // Token de validación para restablecer contraseña
}

export interface JwtResponse {
  access_token: string; // Aquí se asegura de que la interfaz tenga la propiedad access_token
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: User; // Aquí está el usuario real
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private _auth = inject(Auth);
  private offlineRequestsKey = "offlineRequests";
  online = signal(navigator.onLine); // Estado de la conexión

  private url = environment.HOST_SEGURITY;
  private url_login: string = `${environment.HOST_SEGURITY}/auth/login`;
  private url_google: string = `${environment.HOST_SEGURITY}/auth/login/google`;
  private url_reset: string = `${environment.HOST_SEGURITY}/reset`;

  constructor(private http: HttpClient, private router: Router) {
    window.addEventListener("online", () => this.online.set(true));
    window.addEventListener("offline", () => this.online.set(false));
  }

  private logFormData(formData: FormData): void {
    console.log("📦 FormData contents:");
    formData.forEach((value, key) => {
      console.log(
        `${key}: ${value instanceof File ? `[File] ${value.name}` : value}`
      );
    });
  }

  // Método de login estándar
  login(username: string, password: string) {
    const body: ILoginRequest = { username, password };

    //alert(this.url+"   "+body)
    return this.http.post<any>(this.url_login, body);
  }

  // Método para cerrar sesión
  logout(): void {
    sessionStorage.clear();
  }

  // Verifica si el usuario está logueado
  isLogged() {
    return sessionStorage.getItem(environment.TOKEN_NAME) != null;
  }

  // Enviar OTP
  sendOtp(username: string): Observable<any> {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post<any>(
      `${this.url_reset}/sendOtp`,
      { username },
      { headers }
    );
  }

  // Validar OTP
  validateOtp(username: string, otp: string): Observable<any> {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post<any>(
      `${this.url_reset}/validate`,
      { username, onetimepassword: otp },
      { headers }
    );
  }

  // Enviar correo de restablecimiento de contraseña
  sendResetMail(username: string): Observable<any> {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post<any>(
      `${this.url_reset}/sendMail`,
      { username },
      { headers }
    );
  }

  // Restablecer contraseña (OTP o correo)
  resetPassword(random: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post<any>(
      `${this.url_reset}/reset-password/${random}`,
      { newPassword },
      { headers }
    );
  }

  checkRandom(token: string): Observable<any> {
    return this.http.get<any>(`${this.url_reset}/check/${token}`);
  }

  // Método para iniciar sesión con Google
  signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this._auth, provider);
  }

  // Método para enviar el token de Google al backend
  sendGoogleTokenToBackend(token: string) {
    const body: IGoogleRequest = { token };

    //alert("TOKEN GOOGLE: " + JSON.stringify(body)   );

    return this.http.post<any>(this.url_google, body);
  }

  // Obtener el token almacenado en sesión
  getToken(): string | null {
    return sessionStorage.getItem("access_token");
  }

  // Guardar solicitudes offline
  saveOfflineRequests(requests: any[]): void {
    localStorage.setItem(this.offlineRequestsKey, JSON.stringify(requests));
  }

  // Obtener solicitudes offline
  getOfflineRequests(): any[] {
    const storedRequests = localStorage.getItem(this.offlineRequestsKey);
    return storedRequests ? JSON.parse(storedRequests) : [];
  }

  // Eliminar una solicitud offline
  removeOfflineRequest(url: string): void {
    const requests = this.getOfflineRequests();
    const filteredRequests = requests.filter((req) => req.url !== url);
    this.saveOfflineRequests(filteredRequests);
  }
}
