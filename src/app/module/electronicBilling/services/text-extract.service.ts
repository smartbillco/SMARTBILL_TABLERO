import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TextExtractService {
  private baseUrl = `${environment.HOST_DATOS}/ocr`;


  constructor(private http: HttpClient) {}

  // 📸 Extraer texto crudo desde imagen (lista de strings)
  extractTextFromImage(file: File): Observable<{ success: boolean, message: string, data: string[] }> {
    const formData = new FormData();
    formData.append('multipartFile', file);
    return this.http.post<{ success: boolean, message: string, data: string[] }>(
      `${this.baseUrl}/extractImage`,
      formData
    );
  }

  // 📄 Extraer texto crudo desde PDF (lista de strings)
  extractTextFromPDF(file: File): Observable<{ success: boolean, message: string, data: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean, message: string, data: string[] }>(
      `${this.baseUrl}/extractPdf`,
      formData
    );
  }

  // 📄 Extraer detalles de factura desde PDF (mapa clave:valor)
  extractDetailsFromPDF(file: File): Observable<{ success: boolean, message: string, data: { [key: string]: string } }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean, message: string, data: { [key: string]: string } }>(
      `${this.baseUrl}/extract-details/pdf`,
      formData
    );
  }

  // 📸 Extraer detalles de factura desde imagen (mapa clave:valor)
  extractDetailsFromImage(file: File): Observable<{ success: boolean, message: string, data: { [key: string]: string } }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean, message: string, data: { [key: string]: string } }>(
      `${this.baseUrl}/extract-details/image`,
      formData
    );
  }


}
