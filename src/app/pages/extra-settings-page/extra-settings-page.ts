import { Component, ViewEncapsulation, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ToastrService } from "ngx-toastr";
import { UserService } from "../../module/user-management/service/user.service";
import { User } from "../../module/user-management/model/user";
import { environment } from "../../../environments/environment";
import { JwtHelperService } from "@auth0/angular-jwt";
import { tap, catchError, finalize } from "rxjs/operators";
import { of } from "rxjs";
import { NotificationService } from "../service/notification.service";
import { UserConfig } from "../model/userConfig";

interface Currency {
  key: string;
  name: string;
}

interface StorageType {
  value: string;
  label: string;
}

interface Language {
  code: string;
  name: string;
}



interface UserConfigResponse {
  success: boolean;
  message: string;
  data: UserConfig;
}

@Component({
  selector: "extra-settings-page",
  templateUrl: "./extra-settings-page.html",
  standalone: true,
  styleUrls: ["./extra-settings-page.css"],
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class ExtraSettingsPage implements OnInit {
  username: string | null = "";
  userRol: string | null = "";
  userData: User | null = null;
  userId: number = 0;
  isLoading: boolean = true;

  config: UserConfig = {
    currencyKey: 'USD',
    currency: 'Dólar estadounidense', // Valor inicial que coincida con currencyKey
    storageType: 's3',
    language: 'es',
    smsNotifications: false,
    emailNotifications: true,
    pushNotifications: true
  };

  currencies: Currency[] = [
    { key: 'USD', name: 'Dólar estadounidense' },
    { key: 'EUR', name: 'Euro' },
    { key: 'MXN', name: 'Peso mexicano' }
  ];

  storageTypes: StorageType[] = [
    { value: 's3', label: 'Amazon S3' },
    { value: 'local', label: 'Almacenamiento local' }
  ];

  languages: Language[] = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' }
  ];

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  async ngOnInit() {
    try {
      const token = sessionStorage.getItem(environment.TOKEN_NAME);
      if (!token) {
        console.error("Token no encontrado");
        this.isLoading = false;
        return;
      }

      const decodedToken = new JwtHelperService().decodeToken(token);
      this.username = decodedToken?.sub;
      this.userRol = decodedToken?.role;

      if (this.username) {
        await this.fetchUserData(this.username);
        this.loadUserConfig();
      }
    } catch (error) {
      console.error('Error inicializando componente:', error);
      this.isLoading = false;
    }
  }

  fetchUserData(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getUserByUsername(username)
        .pipe(
          tap((response) => {
            if (response?.success && response?.data) {
              this.userData = response.data;
              this.userId = response.data.idUser;
            } else {
              console.warn("Usuario no encontrado");
            }
          }),
          catchError((error) => {
            console.error('Error obteniendo datos de usuario:', error);
            reject(error);
            return of(null);
          }),
          finalize(() => resolve())
        )
        .subscribe();
    });
  }

  private loadUserConfig() {
    if (!this.username) {
        this.notificationService.showError('Nombre de usuario no disponible, usando valores por defecto');
        this.isLoading = false;
        return;
    }

    this.isLoading = true;
    
    this.userService.getUserConfigByUsername(this.username)
        .pipe(
            tap((response: UserConfigResponse) => {
                if (response.success && response.data) {
                  console.log('Datos de configuración recibidos:', response.data); // 👈 Solo los datos
                  
                    this.config = {
                        ...this.config,
                        ...response.data,
                    };
                } else {
                    this.notificationService.showWarning(response.message || 'No se encontró configuración, usando valores por defecto');
                }
            }),
            catchError(error => {
                console.error('Error cargando configuración:', error);
                this.notificationService.showError('Error al cargar configuración, usando valores por defecto');
                return of(null);
            }),
            finalize(() => {
                this.isLoading = false;
            })
        )
        .subscribe();
  }
  
  onSubmit() {
    if (!this.userId) {
      this.notificationService.showError('No se pudo identificar al usuario');
      return;
    }

    this.isLoading = true;
    this.userService.updateUserConfig(this.config)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: UserConfigResponse) => {
          if (response.success) {
            this.notificationService.showSuccess('Configuración guardada correctamente');
            if (response.data) {
              this.config = response.data;
            }
          } else {
            this.notificationService.showError(response.message || 'Error al guardar la configuración');
          }
        },
        error: (err) => {
          this.notificationService.showError('Error al guardar la configuración');
          console.error('Error:', err);
        }
      });
  }
}