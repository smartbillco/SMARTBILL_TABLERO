import { Component, OnDestroy, Renderer2 } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GoogleAuthProvider, UserCredential } from "firebase/auth";
import { CommonModule } from "@angular/common";
import { AppSettings } from "../service/app-settings.service";
import { AuthService } from "../service/auth.service";
import { NotificationService } from "../service/notification.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "login",
  templateUrl: "./login.html",
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule],
})
export class LoginComponent implements OnDestroy {
  username: string = "";
  password: string = "";
  selectedMethod: string | null = null;
  isLoading: boolean = true; 

  constructor(
    private router: Router,
    private renderer: Renderer2,
    public appSettings: AppSettings,
    private loginService: AuthService,
    private notificationService: NotificationService
  ) {
    this.appSettings.appEmpty = true;
    this.renderer.addClass(document.body, "bg-white");
  
    // Verificar si el usuario ya está autenticado
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    if (token) {
      this.router.navigateByUrl("/module/welcome");
    } else {
      this.isLoading = false; // Mostrar el formulario solo si no está autenticado
    }

    //alert("m")
  }
  

  ngOnDestroy() {
    this.appSettings.appEmpty = false;
    this.renderer.removeClass(document.body, "bg-white");
  }

  selectLoginMethod(method: string) {
    this.selectedMethod = method;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.selectedMethod === "traditional") {
      this.login();
    } else if (this.selectedMethod === "google") {
      this.submitWithGoogle();
    }
  }

  login() {
    if (this.username && this.password) {
      this.loginService.login(this.username, this.password).subscribe({
        next: (data) => {
          // Mostrar la respuesta completa para ver qué devuelve el backend
          //console.log("Respuesta completa del backend:", data);

          // Verificar si 'data' y 'access_token' existen en la respuesta
          if (data && data.access_token) {
            // Almacenar el token en sessionStorage
            sessionStorage.setItem(environment.TOKEN_NAME, data.access_token);
            // console.log("Token almacenado:", sessionStorage.getItem(environment.TOKEN_NAME));

            // Navegar después de almacenar el token
            this.router.navigateByUrl("/module/welcome");
          } else if (data && data.data && data.data.access_token) {
            // Si el token está dentro de 'data.data', acceder de esta forma
            sessionStorage.setItem(
              environment.TOKEN_NAME,
              data.data.access_token
            );
            //console.log("Token almacenado:", sessionStorage.getItem(environment.TOKEN_NAME));

            // Navegar después de almacenar el token
            this.router.navigateByUrl("/module/welcome");
          } else {
            console.error("El backend no devolvió un access_token.");
          }
        },
        error: () => {
          // No es necesario manejar el error esta interceptado
        },
      });
    } else {
      this.notificationService.showError(
        "Por favor ingresa un usuario y una contraseña válidos."
      );
    }
  }

  async submitWithGoogle() {
    try {
      const result: UserCredential = await this.loginService.signInWithGoogle();
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token) {
        this.loginService.sendGoogleTokenToBackend(token).subscribe({
          next: (data) => {
            sessionStorage.setItem(environment.TOKEN_NAME, data.access_token);
            this.notificationService.showSuccess(
              "Inicio de sesión exitoso con Google",
              "¡Bienvenido!"
            );
            this.router.navigateByUrl("/module/necessary/welcome");
          },
          error: (error) => {
            this.notificationService.showError(
              error.status === 401
                ? "No autorizado. Asegúrate de que estás usando una cuenta válida de Google."
                : "Error en la autenticación. Inténtalo de nuevo."
            );
          },
        });
      }
    } catch (error: any) {
      this.notificationService.showError(
        error.code === "auth/popup-closed-by-user"
          ? "El popup fue cerrado antes de completar la autenticación. Intenta nuevamente."
          : "Error al iniciar sesión con Google. Inténtalo de nuevo."
      );
    }
  }
}
