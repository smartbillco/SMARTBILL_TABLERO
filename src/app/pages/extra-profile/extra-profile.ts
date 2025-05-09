import { Component, OnDestroy, ChangeDetectorRef, NgZone, ViewEncapsulation } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { JwtHelperService } from "@auth0/angular-jwt";
import { tap } from "rxjs";
import { EditProfileComponent } from "../edit-profile/edit-profile.component";
import { ExtraSettingsPage } from "../extra-settings-page/extra-settings-page";
import { User } from "../../module/user-management/model/user";
import { AppSettings } from "../service/app-settings.service";
import { environment } from "../../../environments/environment";
import { UserService } from "../../module/user-management/service/user.service";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: "extra-profile",
  templateUrl: "./extra-profile.html",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./extra-profile.css"],
  standalone: true,
  imports: [FormsModule, CommonModule, EditProfileComponent, ExtraSettingsPage],
})
export class ExtraProfilePage implements OnDestroy {
  private _profileImageUrl: SafeUrl;
  username: string | null = "";
  userRol: string | null = "";
  userData: User | null = null;
  isEditing = false;
  showOverlay = false;
  userId: number | null = null;

  constructor(
    public appSettings: AppSettings,
    private userService: UserService,
    private zone: NgZone,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef
  ) {
    this.appSettings.appContentClass = "p-0";
    this._profileImageUrl = this.sanitizer.bypassSecurityTrustUrl("assets/img/user/user-1.jpg");
  }

  get profileImageUrl(): SafeUrl {
    return this._profileImageUrl;
  }

  ngOnDestroy() {
    this.appSettings.appContentClass = "";
  }

  async ngOnInit() {
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    if (!token) return console.error("Token no encontrado");

    const decodedToken = new JwtHelperService().decodeToken(token);
    this.username = decodedToken?.sub;
    this.userRol = decodedToken?.role;
    this.userId = decodedToken?.userId;

    if (this.username) {
      this.fetchUserData(this.username);
    }
  }

  fetchUserData(username: string) {
    this.userService
      .getUserByUsername(username)
      .pipe(
        tap((response) => {
          if (response?.success && response?.data) {
            this.userData = response.data;
            this.safeUpdateProfileImage(response.data.photo_url);
            if (!this.userId && response.data.idUser) {
              this.userId = response.data.idUser;
            }
          }
        })
      )
      .subscribe();
  }

  private safeUpdateProfileImage(newUrl: string | undefined) {
    this.zone.run(() => {
      const safeUrl = newUrl 
        ? this.sanitizer.bypassSecurityTrustUrl(newUrl)
        : this.sanitizer.bypassSecurityTrustUrl("assets/img/user/user-1.jpg");
      
      this._profileImageUrl = safeUrl;
      this.cdRef.detectChanges();
    });
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  onProfileUpdated(updatedData: any) {
    this.userData = { ...this.userData, ...updatedData };
    this.isEditing = false;
  }

  onCancelEdit() {
    this.isEditing = false;
  }

  viewPhoto() {
    const unsafeUrl = this.sanitizer.sanitize(4, this._profileImageUrl);
    if (unsafeUrl) window.open(unsafeUrl, "_blank");
  }

  uploadPhoto() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.match("image.*")) {
          alert("Por favor selecciona una imagen válida");
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          alert("La imagen no debe exceder los 2MB");
          return;
        }
        this.uploadSelectedPhoto(file);
      }
    };
    input.click();
  }

  deletePhoto() {
    if (confirm("¿Estás seguro de que deseas eliminar la foto de perfil?")) {
      this.safeUpdateProfileImage(undefined);
      if (this.userId) {
        this.userService.deleteUserPhoto(this.userId).subscribe({
          next: () => console.log("✅ Foto eliminada en el servidor"),
          error: (err) => {
            console.error("❌ Error al eliminar la foto:", err);
            this.safeUpdateProfileImage(this.userData?.photo_url);
          },
        });
      }
    }
  }

  private createButton(text: string, backgroundColor: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = text;
    Object.assign(button.style, {
      marginTop: "10px",
      padding: "10px 20px",
      backgroundColor,
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    });
    return button;
  }

  takePhoto() {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("La función de cámara no está disponible en tu navegador");
      return;
    }

    const constraints: MediaStreamConstraints = {
      video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream: MediaStream) => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        const modal = document.createElement("div");
        Object.assign(modal.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.8)",
          zIndex: "1000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        });

        Object.assign(video.style, {
          maxWidth: "90%",
          maxHeight: "80%",
          borderRadius: "8px",
        });

        const captureBtn = this.createButton("Tomar Foto", "#4CAF50");
        const cancelBtn = this.createButton("Cancelar", "#f44336");

        modal.append(video, captureBtn, cancelBtn);
        document.body.appendChild(modal);

        const cleanup = () => {
          document.body.removeChild(modal);
          stream.getTracks().forEach(track => track.stop());
        };

        captureBtn.onclick = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
                this.showOverlay = true;
                this.uploadSelectedPhoto(file)
                  .finally(() => this.showOverlay = false)
                  .then(cleanup);
              }
            }, "image/jpeg", 0.9);
          }
        };

        cancelBtn.onclick = cleanup;
      })
      .catch((error) => {
        console.error("Error al acceder a la cámara:", error);
        alert(`Error al acceder a la cámara: ${error.message}`);
      });
  }

  async uploadSelectedPhoto(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.safeUpdateProfileImage(e.target.result);

        if (!this.userId) {
          reject(new Error("ID de usuario no disponible"));
          return;
        }

        this.userService.updateUserPhoto(this.userId, file).subscribe({
          next: (response) => {
            if (response.data?.photo_url) {
              this.safeUpdateProfileImage(response.data.photo_url);
            }
            if (this.username) {
              this.fetchUserData(this.username);
            }
            resolve();
          },
          error: (err) => {
            this.safeUpdateProfileImage(this.userData?.photo_url);
            reject(err);
          },
        });
      };

      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsDataURL(file);
    });
  }
}