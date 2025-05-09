import { Injectable } from '@angular/core';
import { TwilioService } from './twilio.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, tap, of, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationTwilioService {

  constructor(
    private twilioService: TwilioService,
    private toastr: ToastrService
  ) {}

  sendNotifications(phoneNumber: string, smsMessage: string, whatsappMessage: string): Observable<any> {
    // Enviar mensaje SMS
    const smsObservable = this.twilioService.sendSMS(phoneNumber, smsMessage).pipe(
      tap(() => {
        this.toastr.success('Mensaje SMS enviado exitosamente');
      }),
      catchError(error => {
        this.toastr.error('Error al enviar mensaje SMS');
        return of(null); // Continuar a pesar del error
      })
    );

    // Enviar mensaje WhatsApp
    const whatsappObservable = this.twilioService.sendWhatsApp(phoneNumber, whatsappMessage).pipe(
      tap(() => {
        this.toastr.success('Mensaje WhatsApp enviado exitosamente');
      }),
      catchError(error => {
        this.toastr.error('Error al enviar mensaje WhatsApp');
        return of(null); // Continuar a pesar del error
      })
    );

    // Retorna ambos observables fusionados
    return smsObservable.pipe(
      switchMap(() => whatsappObservable)
    );
  }
}
