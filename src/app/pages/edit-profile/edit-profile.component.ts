import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from "@angular/core";
import { CommonModule, NgIf, NgClass } from "@angular/common";
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { JwtHelperService } from "@auth0/angular-jwt";
import { of } from "rxjs";
import { catchError, finalize, switchMap, tap } from "rxjs/operators";

import { User } from "../../module/user-management/model/user";
import { NotificationService } from "../service/notification.service";
import { environment } from "../../../environments/environment";
import { EditProfileForm } from "./edit-profile.form";
import { EditProfileService } from "./edit-profile.service";
import { Regime } from "../../module/user-management/model/regime";
import { DocType } from "../../module/user-management/model/doctype";
import { Role } from "../../module/user-management/model/role";

@Component({
  selector: "app-edit-profile",
  templateUrl: "./edit-profile.component.html",
  styleUrls: ["./edit-profile.component.scss"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgIf, NgClass],
  providers: [EditProfileService],
})
export class EditProfileComponent implements OnInit, OnChanges {
  @Input() userData: User | null = null;
  @Input() isEditing = false;
  @Output() profileUpdated = new EventEmitter<User>();
  @Output() cancelled = new EventEmitter<void>();

  regimes: Regime[] = [];
  doctypes: DocType[] = [];
  roles: Role[] = [];

  selectedFile: File | null = null;
  previewImage: string | ArrayBuffer | null = null;
  isLoading = false;
  profileForm: EditProfileForm;

  private username: string | null = "";
  private userId: number = 0;

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private jwtHelper: JwtHelperService,
    private profileService: EditProfileService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.profileForm = new EditProfileForm(fb);
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["userData"]?.currentValue) {
      this.profileForm.patchValues(changes["userData"].currentValue);
      this.updatePreviewImage();
    }

    if (changes["isEditing"]) {
      this.profileForm.toggleState(this.isEditing);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result;
      this.changeDetector.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  updateProfile(): void {
    if (!this.profileForm.formInstance.valid) {
      this.profileForm.formInstance.markAllAsTouched();
      this.notificationService.showWarning(
        "Por favor completa todos los campos obligatorios correctamente.",
        "Formulario inválido"
      );
      return;
    }

    this.isLoading = true;
    const formData = this.profileForm.prepareFormData(this.selectedFile);

    this.profileService.updateUserProfile(this.userId, formData)
      .pipe(
        tap((response) => {
          const updatedUser = this.createUpdatedUser(response.data);
          
          this.userData = updatedUser;
          this.profileForm.patchValues(updatedUser);
          this.updatePreviewImage(updatedUser.photo_url);
          
          this.notificationService.showSuccess(
            response.message || "Perfil actualizado correctamente.",
            "Éxito"
          );

          this.profileUpdated.emit(updatedUser);
        }),
        catchError((error) => {
          const errorMessage = error?.error?.message || 
                            error?.error?.data || 
                            "Error al actualizar el perfil";
          this.notificationService.showError(errorMessage, "Error");
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.changeDetector.detectChanges();
        })
      )
      .subscribe();
  }

  private createUpdatedUser(responseData: any): User {
    return {
      ...this.userData,
      ...responseData,
      photo_url: responseData.photo_url 
        ? `${responseData.photo_url}?${new Date().getTime()}`
        : this.userData?.photo_url,
      roles: responseData.roles || this.userData?.roles
    };
  }

  private updatePreviewImage(photoUrl?: string): void {
    if (photoUrl) {
      this.previewImage = photoUrl;
    } else if (this.userData?.photo_url) {
      this.previewImage = `${this.userData.photo_url}?${new Date().getTime()}`;
    }
    this.changeDetector.detectChanges();
  }

  cancelEdit(): void {
    if (this.userData) {
      this.profileForm.patchValues(this.userData);
      this.updatePreviewImage();
    }
    this.selectedFile = null;
    this.cancelled.emit();
  }

  private loadInitialData(): void {
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    if (!token) {
      console.error("Token no encontrado");
      return;
    }

    const decodedToken = this.jwtHelper.decodeToken(token);
    this.username = decodedToken?.sub;

    if (!this.username) {
      console.error("Nombre de usuario no encontrado en el token");
      return;
    }

    this.isLoading = true;

    this.profileService
      .loadInitialUserData(this.username)
      .pipe(
        tap((user) => {
          if (user) {
            this.userData = user;
            this.userId = user.idUser;
            this.profileForm.patchValues(user);
            this.updatePreviewImage();
          }
        }),
        switchMap(() => this.profileService.loadSelectData()),
        tap((res: any) => {
          this.regimes = res.regimes.data;
          this.doctypes = res.doctypes.data;
          this.roles = res.roles.data;
        }),
        catchError((error) => {
          console.error("Error loading user data:", error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.changeDetector.detectChanges();
        })
      )
      .subscribe();
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.profileForm.formInstance.get(controlName);
    return control ? control.hasError(errorType) && (control.dirty || control.touched) : false;
  }

  hasRole(roleId: number): boolean {
    return this.userData?.roles?.some((r: any) => r.idRole === roleId);
  }

  onRoleChange(event: any, roleId: number): void {
    const rolesArray = this.profileForm.formInstance.get('roles') as FormArray;
    
    if (event.target.checked) {
      if (!rolesArray.value.includes(roleId)) {
        rolesArray.push(this.fb.control(roleId));
      }
    } else {
      const index = rolesArray.value.indexOf(roleId);
      if (index >= 0) {
        rolesArray.removeAt(index);
      }
    }
  }
}