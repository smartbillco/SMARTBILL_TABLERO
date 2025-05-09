import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Attachment,
  CorrespondenceData,
  CorrespondenceResponse
} from '../model/correspondence.model';

@Injectable({
  providedIn: 'root'
})
export class CorrespondenceService {
  private readonly AMOCK_DATA_URL = '/assets/correspondeceData.json';
  private readonly API_URL = `${environment.HOST_SEGURITY}/correspondence`;

  constructor(private http: HttpClient) {}

  // ==================== CRUD Operations ====================
  getAllCorrespondences(): Observable<any[]> {
    return this.http
      .get<any>(this.AMOCK_DATA_URL)
      .pipe(map((data) => data.Correspondence || []));
  }

  
  createCorrespondence(data: CorrespondenceData): Observable<CorrespondenceResponse> {
    return this.http.post<CorrespondenceResponse>(this.API_URL, data);
  }

  createCorrespondenceWithAttachments(data: CorrespondenceData): Observable<CorrespondenceResponse> {
    const formData = this.prepareFormData(data);
    return this.http.post<CorrespondenceResponse>(this.API_URL, formData);
  }

  getById(id: string): Observable<CorrespondenceData> {
    return this.http.get<CorrespondenceData>(`${this.API_URL}/${id}`);
  }

  updateCorrespondence(id: string, data: CorrespondenceData): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, data);
  }

  uploadAdditionalAttachments(correspondenceId: string, files: File[]): Observable<Attachment[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file, file.name));
    return this.http.post<Attachment[]>(`${this.API_URL}/${correspondenceId}/attachments`, formData);
  }

  // ==================== Utility Methods ====================
  private prepareFormData(data: CorrespondenceData): FormData {
    const formData = new FormData();
    const { attachments, ...mainData } = data;
    
    formData.append('correspondence', JSON.stringify(mainData));

    attachments?.forEach(attachment => {
      if (attachment.file) {
        formData.append('files', attachment.file, attachment.name);
      } else if (attachment.fileUrl) {
        formData.append('existingAttachments', JSON.stringify({
          id: attachment.id,
          name: attachment.name,
          fileUrl: attachment.fileUrl
        }));
      }
    });

    return formData;
  }
}