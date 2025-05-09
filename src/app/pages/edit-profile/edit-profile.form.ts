import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from "@angular/forms";
import { ProfileFormControls } from "./edit-profile.types";
import { User } from "../../module/user-management/model/user";

export class EditProfileForm {
  private form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.createForm();
    this.form.disable();
  }

  get formInstance(): FormGroup {
    return this.form;
  }

  get formControls(): ProfileFormControls {
    return {
      username: this.form.get("username") as AbstractControl,
      firstName: this.form.get("firstName") as AbstractControl,
      secondName: this.form.get("secondName") as AbstractControl,
      lastName: this.form.get("lastName") as AbstractControl,
      secondLastName: this.form.get("secondLastName") as AbstractControl,
      documentType: this.form.get("documentType") as AbstractControl,
      documentNumber: this.form.get("documentNumber") as AbstractControl,
      roles: this.form.get("roles") as FormArray,
      phoneNumber: this.form.get("phoneNumber") as AbstractControl,
      address: this.form.get("address") as AbstractControl,
      email: this.form.get("email") as AbstractControl,
      regime: this.form.get("regime") as AbstractControl,
      password: this.form.get("password") as AbstractControl,
    };
  }

  private createForm(): FormGroup {
    return this.fb.group({
      username: ["", Validators.required],
      firstName: ["", [Validators.required, Validators.maxLength(50)]],
      secondName: ["", Validators.maxLength(50)],
      lastName: ["", [Validators.required, Validators.maxLength(50)]],
      secondLastName: ["", Validators.maxLength(50)],
      documentType: ["", Validators.required],
      documentNumber: ["", [Validators.required, Validators.maxLength(20)]],
      roles: this.fb.array([], Validators.required),
      phoneNumber: [
        "",
        [Validators.required, Validators.pattern("^\\+?[0-9]{9,15}$")],
      ],
      address: ["", [Validators.required, Validators.maxLength(200)]],
      email: ["", [Validators.required, Validators.email]],
      regime: ["", Validators.maxLength(100)],
      password: [""],
    });
  }

  patchValues(userData: User): void {
    if (!userData) return;

    this.form.patchValue({
      username: userData.username ?? "",
      firstName: userData.firstName ?? "",
      secondName: userData.secondName ?? "",
      lastName: userData.lastName ?? "",
      secondLastName: userData.secondLastName ?? "",
      documentType: userData.documentType ?? "",
      documentNumber: userData.documentNumber ?? "",
      phoneNumber: userData.phoneNumber ?? "",
      email: userData.email ?? "",
      address: userData.address ?? "",
      regime: userData.regime?? "",
      password: "",
    });

    this.updateRoles(userData.roles);
  }

  private updateRoles(roles: any[] | undefined): void {
    const rolesArray = this.form.get("roles") as FormArray;
    rolesArray.clear();
    
    if (roles && roles.length > 0) {
      roles.forEach((role) => {
        rolesArray.push(this.fb.control(role.idRole));
      });
    }
  }

  toggleState(isEditing: boolean): void {
    isEditing ? this.form.enable() : this.form.disable();
  }

  prepareFormData(file: File | null): FormData {
    const formValue = this.form.getRawValue();
    const formData = new FormData();

    // Campos básicos
    const fields = [
      "username",
      "firstName",
      "secondName",
      "lastName",
      "secondLastName",
      "documentType",
      "documentNumber",
      "phoneNumber",
      "address",
      "email",
      "regime",
      "password"
    ];

    fields.forEach((field) => {
      if (formValue[field] !== null && formValue[field] !== undefined) {
        formData.append(field, formValue[field].toString());
      }
    });

    // Archivo de imagen
    if (file) {
      formData.append("photo", file, file.name);
    }

    // Roles
    const rolesArray = this.form.get("roles") as FormArray;
    if (rolesArray.length > 0) {
      formData.append("roles", JSON.stringify(rolesArray.value));
    }

    return formData;
  }
}