import { Injectable } from '@angular/core';
import moment from 'moment';
import { 
  CorrespondenceData, 
  Sender, 
  CorrespondenceType, 
  DocumentStatus, 
  CorrespondenceCategory, 
  Dependence,
  Attachment
} from '../model/correspondence.model';

interface DateRange {
  startDate: moment.Moment;
  endDate: moment.Moment;
}

@Injectable({ providedIn: 'root' })
export class FilterService {
  filterCorrespondences(
    correspondences: CorrespondenceData[] | null,
    searchText: string | null | undefined,
    senders: Sender[],
    selectedType: CorrespondenceType | null,
    selectedStatus: DocumentStatus | null,
    selectedCategory: CorrespondenceCategory | null,
    selectedDependence: Dependence | null,
    dateRange: DateRange
  ): CorrespondenceData[] {
    if (!correspondences) return [];

    const searchTerm = searchText?.toLowerCase().trim() || '';
    const { startDate, endDate } = dateRange;

    return correspondences.filter(c => {
      // 1. Filtrado por rango de fechas
      if (c.filingDate) {
        const filingDate = moment(c.filingDate);
        if (filingDate.isBefore(startDate, 'day') || filingDate.isAfter(endDate, 'day')) {
          return false;
        }
      }

      // 2. Filtrado por tipo de correspondencia
      if (selectedType && c.correspondenceType?.codCorrespondenceType !== selectedType.codCorrespondenceType) {
        return false;
      }

      // 3. Filtrado por estado del documento
      if (selectedStatus && c.documentStatus?.codDocumentStatus !== selectedStatus.codDocumentStatus) {
        return false;
      }

      // 4. Filtrado por categoría
      if (selectedCategory && c.correspondenceCategory?.codCorrespondenceCategory !== selectedCategory.codCorrespondenceCategory) {
        return false;
      }

      // 5. Filtrado por dependencia
      if (selectedDependence && c.dependence?.codDependence !== selectedDependence.codDependence) {
        return false;
      }

      // Si no hay término de búsqueda, retornar los que pasaron los filtros anteriores
      if (!searchTerm) return true;

      // 6. Búsqueda en campos básicos
      const basicFields = [
        c.filingNumber,
        c.subject,
        c.text,
        c.status,
        c.externalFiling,
        c.filingDate,
        c.documentDate,
        c.correspondenceType?.descripcion,
        c.documentStatus?.descripcion,
        c.dependence?.descripcion,
        c.correspondenceCategory?.descripcion,
        c.correspondenceCategory?.expiresInDays?.toString(),
      ].some(field => field?.toString().toLowerCase().includes(searchTerm));

      if (basicFields) return true;

      // 7. Búsqueda en información del remitente
      if (this.checkSenderMatch(c.senders, searchTerm)) {
        return true;
      }

      // 8. Búsqueda en información del destinatario (si existe)
      if (c.recipients && this.checkSenderMatch(c.recipients, searchTerm)) {
        return true;
      }

      // 9. Búsqueda en adjuntos
      if (this.checkAttachmentsMatch(c.attachments, searchTerm)) {
        return true;
      }

      return false;
    });
  }

  private checkSenderMatch(
    sender: Sender | undefined, 
    searchTerm: string
  ): boolean {
    if (!sender) return false;

    return [
      sender.userName,
      sender.firstName,
      sender.lastName,
      sender.documentType,
      sender.documentNumber,
      sender.phoneNumber,
      sender.email,
      sender.address,
    ].some(field => field?.toLowerCase().includes(searchTerm));
  }

  private checkAttachmentsMatch(
    attachments: Attachment[] | undefined,
    searchTerm: string
  ): boolean {
    if (!attachments) return false;

    return attachments.some(a => 
      a.name?.toLowerCase().includes(searchTerm) || 
      a.description?.toLowerCase().includes(searchTerm)
    );
  }
}