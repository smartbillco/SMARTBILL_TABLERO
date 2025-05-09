import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // Configuración predeterminada de los toasts
  private defaultToastOptions = {
    timeOut: 5000, // Tiempo predeterminado
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-bottom-right',
    preventDuplicates: true,
  };

  constructor(private toastr: ToastrService) {}

  // Método genérico para mostrar notificaciones con duración opcional
  private showToast(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    title: string,
    timeOut?: number // Parámetro opcional para el tiempo de duración
  ): void {
    const toastOptions = { ...this.defaultToastOptions, timeOut: timeOut ?? this.defaultToastOptions.timeOut };
    this.toastr[type](message, title, toastOptions);
  }

  // Métodos públicos con duración opcional
  showSuccess(message: string, title: string = 'Éxito', timeOut?: number): void {
    this.showToast('success', message, title, timeOut);
  }

  showError(message: string, title: string = 'Error', timeOut?: number): void {
    this.showToast('error', message, title, timeOut);
  }

  showWarning(message: string, title: string = 'Advertencia', timeOut?: number): void {
    this.showToast('warning', message, title, timeOut);
  }

  showInfo(message: string, title: string = 'Información', timeOut?: number): void {
    this.showToast('info', message, title, timeOut);
  }
}
