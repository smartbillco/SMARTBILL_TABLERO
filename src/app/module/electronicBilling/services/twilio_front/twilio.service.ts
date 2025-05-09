import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TwilioService {
  private baseUrl = environment.twilioUrl;

  constructor(private http: HttpClient) {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${environment.twilioAccountSid}:${environment.twilioAuthToken}`)
    });
  }

  private sendMessage(to: string, body: string, from: string): Observable<any> {
    const url = `${this.baseUrl}/Accounts/${environment.twilioAccountSid}/Messages.json`;
    const data = new URLSearchParams();
    data.set('To', to);
    data.set('From', from);
    data.set('Body', body);

    console.log('Sending request to Twilio with data:', {
      To: to,
      From: from,
      Body: body
    });

    return this.http.post(url, data.toString(), { headers: this.createHeaders() });
  }

  sendSMS(to: string, body: string): Observable<any> {
    return this.sendMessage(to, body, '+18454031650');
  }

  sendWhatsApp(to: string, body: string): Observable<any> {
    return this.sendMessage(`whatsapp:${to}`, body, 'whatsapp:+14155238886');
  }

  sendEmail(to: string, subject: string, body: string): Observable<any> {
    // No es posible enviar correos electrónicos directamente a través de Twilio usando solo el frontend
    // Se necesitará un servicio de correo electrónico, por ejemplo, SendGrid.
    const emailServiceUrl = 'https://api.sendgrid.com/v3/mail/send';
    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject
        }
      ],
      from: { email: 'your-email@example.com' },
      content: [
        {
          type: 'text/plain',
          value: body
        }
      ]
    };

    return this.http.post(emailServiceUrl, emailData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_SENDGRID_API_KEY'
      })
    });
  }
}