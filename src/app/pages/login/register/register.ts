import { Component, OnDestroy, Renderer2 } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";

import { User } from "../../../module/user-management/model/user";
import { DocType } from "../../../module/user-management/model/doctype";
import { Regime } from "../../../module/user-management/model/regime";
import { Role } from "../../../module/user-management/model/role";
import { AuthService } from "../../service/auth.service";
import { NotificationService } from "../../service/notification.service";
import { AppSettings } from "../../service/app-settings.service";
import { RegimeService } from "../../../module/user-management/service/regime.service";
import { DocTypeService } from "../../../module/user-management/service/doctype.service";
import { RoleService } from "../../../module/user-management/service/role.service";
import { UserService } from "../../../module/user-management/service/user.service";

@Component({
  selector: "register",
  templateUrl: "./register.html",
  styleUrl: "./register.scss",
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false; // Variable para controlar el estado de envío

  profileForm!: FormGroup;
  regimes: Regime[];
  doctypes: DocType[];
  roles: Role[];

  selectedPhoto: File | null = null;

  ngOnInit(): void {
    this.loadSelect();
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private renderer: Renderer2,
    public appSettings: AppSettings,

    private regimeService: RegimeService,
    private doctypeService: DocTypeService,
    private roleService: RoleService,
    private userService: UserService
  ) {
    this.appSettings.appEmpty = true;
    this.renderer.addClass(document.body, "bg-white");

    this.registerForm = this.fb.group({
      username: ["", Validators.required],

      firstName: ["", Validators.required],
      secondName: [""],
      lastName: ["", Validators.required],
      secondLastName: [""],
      documentType: ["", Validators.required],
      documentNumber: [
        "",
        [Validators.required, Validators.pattern(/^[0-9]+$/)],
      ],
      phoneNumber: ["", Validators.required],
      address: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      regime: [null, Validators.required],

      password: ["", [Validators.required, Validators.minLength(2)]],
      acceptTerms: [false, Validators.requiredTrue],
      roles: this.fb.array([]),
    });
  }

  onSubmit() {
    
    if (this.registerForm.invalid || !this.selectedPhoto) {
      this.notificationService.showError(
        "Por favor completa todos los campos y selecciona una foto."
      );
      return;
    }

    const formValue = this.registerForm.value;

    // Obtener el régimen completo
    const selectedRegime = this.regimes.find(
      (r) => r.idRegime == formValue.regime || r.idRegime.toString() === formValue.regime
    );

    if (!selectedRegime) {
      this.notificationService.showError("Régimen seleccionado no válido");
      return;
    }

    const userDTO: User = {
      ...formValue,
      regime: selectedRegime.nameRegime,
      roles: [2], // Rol constante
    };

    this.userService.registerUser(userDTO, this.selectedPhoto).subscribe({
      next: (response) => {
        this.notificationService.showSuccess("Registro exitoso!");
        this.router.navigate(["/login"]);
      },
      error: (err) => {
        console.error("Error:", err);
        this.notificationService.showError(
          err.error?.message || "Error en el registro"
        );
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.registerForm.get(controlName);
    return control?.touched && !!control.errors?.[errorType];
  }

  ngOnDestroy() {
    this.appSettings.appEmpty = false;
    this.renderer.removeClass(document.body, "bg-white");
  }

  formSubmit(f: NgForm) {
    this.router.navigate(["login"]);
  }

  loadSelect() {
    /*
    this.regimeService.findAll().subscribe({
      next: (response: any) => {
        this.regimes = response.data;
      },
    });*/

    this.regimeService.findAll().subscribe({
      next: (response: any) => {
        this.regimes = response.data;
        console.log("Regímenes cargados:", this.regimes); // Verifica los datos
      },
      error: (err) => {
        console.error("Error al cargar regímenes:", err);
        this.notificationService.showError("Error al cargar regímenes");
      },
    });

    this.doctypeService.findAll().subscribe({
      next: (response: any) => {
        this.doctypes = response.data;
      },
    });
    /*
    this.roleService.findAll().subscribe({
      next: (response: any) => {
        this.roles = response.data;
        //console.log("Roles cargados:", JSON.parse(JSON.stringify(this.roles)));
      },
    });*/
    //this.roleService.listRolesMock().subscribe((roles) => { this.roles = roles;  });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Validar tipo de archivo
      if (!file.type.match("image.*")) {
        this.notificationService.showError(
          "Por favor selecciona una imagen válida"
        );
        return;
      }
      // Validar tamaño (ej. 2MB máximo)
      if (file.size > 2 * 1024 * 1024) {
        this.notificationService.showError("La imagen no debe exceder los 2MB");
        return;
      }
      this.selectedPhoto = file;
    }
  }

  /*
  onCheckboxChange(isChecked: boolean, roleId: number) {
    const rolesArray = this.registerForm.get("roles") as FormArray;
    roleId = Number(roleId); 

    if (isNaN(roleId)) {
      console.error("ID de rol inválido:", roleId);
      return;
    }

    if (isChecked) {
      if (!rolesArray.value.includes(roleId)) {
        rolesArray.push(this.fb.control(roleId));
      }
    } else {
      const index = rolesArray.controls.findIndex((x) => x.value === roleId);
      if (index >= 0) {
        rolesArray.removeAt(index);
      }
    }
  }*/
}
