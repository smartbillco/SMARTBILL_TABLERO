import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../pages/service/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [ FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.css'
})
export class ForgotComponent {
  resetForm: FormGroup;
  otpForm: FormGroup;
  emailForm: FormGroup;
  validationStep: boolean = false;
  random: string | null = null;
  isOtpValid: boolean = false;
  selectedMethod: string = 'otp'; // Método seleccionado: 'otp' o 'email'
  showOtpForm: boolean = false;
  showEmailForm: boolean = false;
  isTokenValid: boolean = false;

  // Variables para deshabilitar el botón
  otpButtonDisabled: boolean = false;
  emailButtonDisabled: boolean = false;
  otpTimer: number = 0;
  emailTimer: number = 0;

  constructor(
    private route: ActivatedRoute,
    private resetService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.resetForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.otpForm = this.formBuilder.group({
      username: ['', Validators.required],
      otp: [''] // Se completa en la validación del OTP
    });

    this.emailForm = this.formBuilder.group({
      username: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
  }

  // Cambiar el método de recuperación
  onMethodChange(method: string) {
    this.selectedMethod = method;
    this.showOtpForm = method === 'otp';
    this.showEmailForm = method === 'email';
  }

  // Enviar OTP (requiere nombre de usuario y número de teléfono)
  sendOtp() {
    const username = this.otpForm.get('username')?.value;
    this.resetService.sendOtp(username).subscribe(
      response => {
        this.otpButtonDisabled = true;
        this.startOtpTimer();
        this.isOtpValid = true;
        alert('OTP enviado con éxito.');
      },
      error => {
        this.isOtpValid = false;
        console.error('Error al enviar OTP:', error);
        alert('Error al enviar OTP.');
      }
    );
  }

  // Funciones para iniciar los temporizadores
  startOtpTimer() {
    this.otpTimer = 60; // 3 minutos en segundos
    const interval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) {
        this.otpButtonDisabled = false;
        clearInterval(interval);
      }
    }, 1000);
  }

  startEmailTimer() {
    this.emailTimer = 60; // 3 minutos en segundos
    const interval = setInterval(() => {
      this.emailTimer--;
      if (this.emailTimer <= 0) {
        this.emailButtonDisabled = false;
        clearInterval(interval);
      }
    }, 1000);
  }

  // Validar OTP
  validateOtp() {
    const username = this.otpForm.get('username')?.value;
    const otp = this.otpForm.get('otp')?.value;

    this.resetService.validateOtp(username, otp).subscribe(
      response => {
        if (response.valid) {
          console.log('OTP válido:', response);

          // Redirigir a la nueva URL con el token
          this.router.navigate(['/forgot', response.token]);
        } else {
          console.log('OTP inválido:', response.message);
        }
      },
      error => {
        console.error('Error al validar OTP:', error);
        alert('Error al validar OTP.');
      }
    );
  }

  // Enviar correo de restablecimiento de contraseña
  sendResetMail() {
    const username = this.emailForm.get('username')?.value;
    this.resetService.sendResetMail(username).subscribe(
      response => {
        this.emailButtonDisabled = true;
        this.startEmailTimer();
        alert('Correo enviado con éxito.');
      },
      error => {
        console.error('Error al enviar correo:', error);
        alert('Error al enviar correo de restablecimiento.');
      }
    );
  }

  // Restablecer la contraseña
  resetPassword() {
    const newPassword = this.resetForm.get('newPassword')?.value;

    if (this.random) {
      this.resetService.resetPassword(this.random, newPassword).subscribe(
        response => {
          alert('Contraseña restablecida con éxito.');
          this.router.navigate(['/login']); // Redirige a la página de login
        },
        error => {
          console.error('Error al restablecer la contraseña:', error);
          alert('Error al restablecer la contraseña.');
        }
      );
    } else {
      alert('No se encontró un token válido.');
    }
  }

}
