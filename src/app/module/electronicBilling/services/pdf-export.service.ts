import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class PdfExportService {
  constructor() {}

  async downloadChartsAsPDF(elementId: string) {
    
    const element = document.getElementById(elementId);

    if (element) {
      try {
       
        
      } catch (error) {
        console.error('Error al generar el PDF:', error);
      }
    } else {
      console.error(`Elemento con ID ${elementId} no encontrado.`);
    }
  }
}