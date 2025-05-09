import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; // Si usas toastr para mensajes de alerta
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../pages/service/auth.service';

@Component({
  selector: 'app-random',
  templateUrl: './random.component.html',
  standalone: true,
  imports: [ FormsModule, ReactiveFormsModule, CommonModule],
  styleUrls: ['./random.component.css']
})
export class RandomComponent implements OnInit {
  token: string | null = null;
  isTokenValid: boolean = false;
  isLoading: boolean = false;  // Para mostrar un cargador mientras se valida el token

  constructor(
    private route: ActivatedRoute,
    private passwordService: AuthService, // Servicio para validar el token
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Obtener el token desde la ruta
    this.route.paramMap.subscribe(params => {
      this.token = params.get('random');
      if (this.token) {
        this.validateToken();
      } else {
        this.toastr.error('Token no encontrado.');
      }
    });
  }
  
  validateToken(): void {
    if (this.token) {
      this.passwordService.checkRandom(this.token).subscribe(
        (response) => {
          if (response.message === "El token es válido.") {
            this.isTokenValid = true;
          } else {
            this.toastr.error('El token es inválido o ha expirado.');
          }
        },
        (error) => {
          console.error(error);  // Para depurar errores
          this.toastr.error('Hubo un error al validar el token.');
        }
      );
    }
  }

  // Método para enviar la nueva contraseña
  resetPassword(newPassword: string): void {
    if (this.token && this.isTokenValid) {
      this.passwordService.resetPassword(this.token, newPassword).subscribe(
        (response) => {
          this.toastr.success('Contraseña restablecida con éxito.');
          this.router.navigate(['/login']); // Redirige al login
        },
        (error) => {
          this.toastr.error('Error al restablecer la contraseña.');
          console.error('Error al restablecer la contraseña:', error);
        }
      );
    } else {
      this.toastr.error('Por favor, valida primero el token.');
    }
  }
}
