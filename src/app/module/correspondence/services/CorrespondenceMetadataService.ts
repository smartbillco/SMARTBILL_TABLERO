import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Sender,
  CorrespondenceCategory,
  Dependence,
  DocumentStatus,
  CorrespondenceType
} from '../model/correspondence.model';

@Injectable({
  providedIn: 'root'
})
export class CorrespondenceMetadataService {
  private readonly MOCK_DATA_URL = '/assets/CorrespondenceMetadata.json';

  // Metadata cache
  private cachedMetadata: {
    correspondenceTypes?: CorrespondenceType[];
    documentStatuses?: DocumentStatus[];
    correspondenceCategories?: CorrespondenceCategory[];
    dependences?: Dependence[];
    senders?: Sender[];
  } = {};

  constructor(private http: HttpClient) {}

  async loadAllMetadata(): Promise<void> {
    if (Object.keys(this.cachedMetadata).length > 0) return;

    try {
      const requests = {
        correspondenceTypes: this.getCorrespondenceTypesFromSource(),
        documentStatuses: this.getDocumentStatusesFromSource(),
        correspondenceCategories: this.getCorrespondenceCategoriesFromSource(),
        dependences: this.getDependencesFromSource(),
        senders: this.getSendersFromSource()
      };

      const results = await firstValueFrom(forkJoin(requests));
      
      this.cachedMetadata = {
        correspondenceTypes: results.correspondenceTypes,
        documentStatuses: results.documentStatuses,
        correspondenceCategories: results.correspondenceCategories,
        dependences: results.dependences,
        senders: results.senders
      };

          // Mostrar dependencias en la consola
    console.log('Dependencias cargadas:', this.cachedMetadata.dependences);

    } catch (error) {
      console.error('Error loading metadata', error);
      throw error;
    }
  }

  // ==================== Public Getters ====================
  getCorrespondenceTypes(): Observable<CorrespondenceType[]> {
    return this.cachedMetadata.correspondenceTypes 
      ? new Observable(observer => observer.next(this.cachedMetadata.correspondenceTypes))
      : this.getCorrespondenceTypesFromSource();
  }

  getDocumentStatuses(): Observable<DocumentStatus[]> {
    return this.cachedMetadata.documentStatuses
      ? new Observable(observer => observer.next(this.cachedMetadata.documentStatuses))
      : this.getDocumentStatusesFromSource();
  }

  getCorrespondenceCategories(): Observable<CorrespondenceCategory[]> {
    return this.cachedMetadata.correspondenceCategories
      ? new Observable(observer => observer.next(this.cachedMetadata.correspondenceCategories))
      : this.getCorrespondenceCategoriesFromSource();
  }

  getDependences(): Observable<Dependence[]> {
    return this.cachedMetadata.dependences
      ? new Observable(observer => observer.next(this.cachedMetadata.dependences))
      : this.getDependencesFromSource();
  }

  getSenders(): Observable<Sender[]> {
    return this.cachedMetadata.senders
      ? new Observable(observer => observer.next(this.cachedMetadata.senders))
      : this.getSendersFromSource();
  }

  getSenderName(idUser?: string | number): string {
    if (!idUser || !this.cachedMetadata.senders) return "Unknown";
    
    const sender = this.cachedMetadata.senders.find(s => 
      s.idUser?.toString() === idUser.toString()
    );
    return sender ? `${sender.firstName} ${sender.lastName}` : "Unknown";
  }

  clearCache(): void {
    this.cachedMetadata = {};
  }

  // ==================== Private Data Loaders ====================
  private getSendersFromSource(): Observable<Sender[]> {
    return this.http.get<any>(this.MOCK_DATA_URL).pipe(
      map(data => data.Senders || [])
    );
  }

  private getCorrespondenceTypesFromSource(): Observable<CorrespondenceType[]> {
    return this.http.get<any>(this.MOCK_DATA_URL).pipe(
      map(data => (data.CorrespondenceType || []).map((item: any) => ({
        codCorrespondenceType: item.codCorrespondenceType || 0,
        descripcion: item.descripcion
      }))
    ));
  }

  private getDocumentStatusesFromSource(): Observable<DocumentStatus[]> {
    return this.http.get<any>(this.MOCK_DATA_URL).pipe(
      map(data => (data.DocumentStatus || []).map((item: any) => ({
        codDocumentStatus: item.codDocumentStatus || 0,
        descripcion: item.descripcion
      }))
    ));
  }

  private getCorrespondenceCategoriesFromSource(): Observable<CorrespondenceCategory[]> {
    return this.http.get<any>(this.MOCK_DATA_URL).pipe(
      map(data => (data.CorrespondenceCategory || []).map((item: any) => ({
        codCorrespondenceCategory: item.codCorrespondenceCategory || '',
        descripcion: item.descripcion,
        expiresInDays: item.expiresInDays || 0
      }))
    ));
  }

  private getDependencesFromSource(): Observable<Dependence[]> {
    return this.http.get<any>(this.MOCK_DATA_URL).pipe(
      map(data => (data.Dependence || []).map((item: any) => ({
        codDependence: item.codDependence || '',
        descripcion: item.descripcion
      }))
    ));
  }
}