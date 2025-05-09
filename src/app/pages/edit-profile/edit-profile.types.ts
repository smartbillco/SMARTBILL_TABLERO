import { AbstractControl, FormArray } from "@angular/forms";

export interface ProfileFormValues {
    username: string;
    firstName: string;
    secondName: string;
    lastName: string;
    secondLastName: string;
    documentType: string;
    documentNumber: string;
    roles: number[];
    phoneNumber: string;
    address: string;
    email: string;
    regime: string;
    password: string;
  }
  
  export interface ProfileFormControls {
    username: AbstractControl;
    firstName: AbstractControl;
    secondName: AbstractControl;
    lastName: AbstractControl;
    secondLastName: AbstractControl;
    documentType: AbstractControl;
    documentNumber: AbstractControl;
    roles: FormArray;
    phoneNumber: AbstractControl;
    address: AbstractControl;
    email: AbstractControl;
    regime: AbstractControl;
    password: AbstractControl;
  }
  