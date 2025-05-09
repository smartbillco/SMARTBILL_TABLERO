import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../../user-management/model/api-response.model';
import { GroupedInvoiceResponse } from '../../user-management/model/grouped-invoice-response.model';
import { FileRequest } from '../../user-management/model/file-request.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly apiUrl = `${environment.HOST_SEGURITY}/file`;

  constructor(private http: HttpClient) { }

  uploadFiles(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }

  searchFiles(fileType: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search?fileType=${fileType}`);
  }

  deleteFile(fileId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${fileId}`);
  }

  /**
   * Maneja eventos de progreso de carga
   */
  private getUploadEventMessage(event: HttpEvent<any>) {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        // Calcula el porcentaje de progreso
        const percentDone = Math.round(100 * event.loaded / (event.total || 1));
        return { status: 'progress', message: percentDone };

      case HttpEventType.Response:
        return event.body;

      default:
        return `Unhandled event: ${event.type}`;
    }
  }

  /**
   * Maneja errores HTTP
   */
  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error?.message) {
      // Error del servidor con mensaje
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.statusText) {
      errorMessage = error.statusText;
    }

    console.error('Error in FileService:', error);
    return throwError(() => new Error(errorMessage));
  }
}