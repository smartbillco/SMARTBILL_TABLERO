import { Injectable } from '@angular/core';
import { DocumentStatus } from '../model/correspondence.model';

@Injectable({ providedIn: 'root' })
export class CorrespondenceUIService {
  getStatusColorClass(status?: DocumentStatus | null): string {
    if (!status) return "text-secondary";

    switch (status.descripcion) {
      case "Recibido": return "text-info";
      case "Tramitado y archivado": return "text-primary";
      case "Archivado": return "text-primary";
      case "Respondido": return "text-success";
      case "No Requiere respuesta": return "text-secondary";
      case "Respondido via Email": return "text-success";
      case "Direccionado para tramite": return "text-warning";
      case "Respondido parcialmente": return "text-warning";
      case "Redireccionado para respuesta de tercero": return "text-warning";
      case "Traslado por competencia": return "text-warning";
      case "Proceso iniciado": return "text-info";
      case "Proceso terminado": return "text-success";
      default: return "text-secondary";
    }
  }

  getStatusBadgeClass(status?: string): string {
    if (!status) return "bg-secondary";

    switch (status) {
      case "Recibido": return "bg-info";
      case "Tramitado y archivado": return "bg-primary";
      case "Archivado": return "bg-primary";
      case "Respondido": return "bg-success";
      case "No Requiere respuesta": return "bg-secondary";
      case "Respondido via Email": return "bg-success";
      case "Direccionado para tramite": return "bg-warning";
      case "Respondido parcialmente": return "bg-warning";
      case "Redireccionado para respuesta de tercero": return "bg-warning";
      case "Traslado por competencia": return "bg-warning";
      case "Proceso iniciado": return "bg-info";
      case "Proceso terminado": return "bg-success";
      default: return "bg-secondary";
    }
  }

  updateColumnVisibility(columns: any[], isLargeScreen: boolean): any[] {
    return columns.map(col => {
      col.hidden = !isLargeScreen &&
        col.prop !== "filingNumber" &&
        col.prop !== "filingDate" &&
        col.prop !== "subject";
      return col;
    });
  }
}