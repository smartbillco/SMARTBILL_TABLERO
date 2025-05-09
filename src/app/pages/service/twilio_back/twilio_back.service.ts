import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TwilioService {

  private apiUrl = 'http://localhost:8086/twilio/webhook'; // URL del backend

  constructor(private http: HttpClient) {}

  sendWhatsAppMessage(from: string, body: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const params = new URLSearchParams();
    params.set('From', `whatsapp:${from}`);
    params.set('Body', body);

    return this.http.post(this.apiUrl, params.toString(), { headers });
  }
}
