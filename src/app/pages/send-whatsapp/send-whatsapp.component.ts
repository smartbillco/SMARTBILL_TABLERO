import { Component } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { TwilioService } from '../service/twilio_back/twilio_back.service';

@Component({
  selector: 'app-send-whatsapp',
  templateUrl: './send-whatsapp.component.html',
  styleUrls: ['./send-whatsapp.component.scss'],
    standalone: true,
    imports: [
CommonModule,FormsModule
    ],
  })
export class SendWhatsappComponent {

  fromNumber: string = '';
  messageBody: string = '';
  responseMessage: string = '';

  constructor(private twilioService: TwilioService) {}

  sendMessage() {
    if (!this.fromNumber || !this.messageBody) {
      this.responseMessage = "Por favor, ingrese el número y el mensaje.";
      return;
    }

    this.twilioService.sendWhatsAppMessage(this.fromNumber, this.messageBody)
      .subscribe({
        next: () => this.responseMessage = "Mensaje enviado correctamente!",
        error: (err) => this.responseMessage = "Error al enviar mensaje: " + err.message
      });
  }
}
