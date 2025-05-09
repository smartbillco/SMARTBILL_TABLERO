import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { Company, Invoice } from '../../model/company.model';
import { FileUploadComponent } from '../file-upload/file-upload.component';

@Component({
  selector: 'app-pdf-reader',
  templateUrl: './pdf-reader.component.html',
  styleUrls: ['./pdf-reader.component.css'],
  standalone: true,
  imports: [CommonModule,],
})
export class PdfReaderComponent {
  companyData: Company | null = null;
  parsingError: string | null = null;
  isLoading: boolean = false;

  constructor() {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = './assets/pdfjs/pdf.worker.min.js';
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) {
      this.parsingError = 'Por favor selecciona un archivo.';
      return;
    }

    if (file.type !== 'application/pdf') {
      this.parsingError = 'El archivo seleccionado no es un PDF válido.';
      return;
    }

    this.isLoading = true;
    this.parsingError = null;

    try {
      const pdfData = await this.readFileAsArrayBuffer(file);
      const pdf = await (pdfjsLib as any).getDocument({ data: pdfData }).promise;
      const fullText = await this.extractTextFromPdf(pdf);

      // Procesamos el texto completo para generar el objeto Invoice
      const invoice = this.parsePdfInvoice(fullText);
      // Integramos esa información en el objeto Company
      this.companyData = this.populateCompanyData(invoice);

      console.log('Datos de la empresa:', this.companyData);
    } catch (error) {
      console.error('Error procesando el PDF:', error);
      this.parsingError = 'Error al procesar el archivo PDF. Por favor verifica que sea válido.';
    } finally {
      this.isLoading = false;
    }
  }

  private async readFileAsArrayBuffer(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private async extractTextFromPdf(pdf: any): Promise<string> {
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ') + '\n';
      fullText += pageText;
    }
    return fullText;
  }

  /**
   * Procesa el texto completo del PDF y extrae la información mínima requerida:
   * - Nombre (extraído del campo "Cliente:")
   * - NIT (extraído del campo "NIT/CC:")
   * - Ítems: descripción, valor unitario y valor de IVA.
   */
  private parsePdfInvoice(text: string): Invoice {
    // Función auxiliar para extraer valores mediante regex
    const extractField = (regex: RegExp, defaultValue: string = 'No encontrado'): string => {
      const match = text.match(regex);
      return match ? match[1].trim() : defaultValue;
    };

    // Extraemos el nombre y el NIT/CC
    const nombre = extractField(/Cliente:\s*([^\n]+)/i);
    // Aquí se puede elegir si asignar el NIT al campo "id" o guardarlo en xml_anidado
    const nit = extractField(/NIT\/CC:\s*([^\n]+)/i);

    // Extraemos la información de la tabla de ítems
    const invoiceItems = this.parseInvoiceItems(text);

    return {
      expanded: false,
      // Usamos el NIT como identificador único en este ejemplo;
      // alternativamente, podrías usar otro campo (como "Consecutivo Electrónico")
      id: nit,
      cliente: nombre,
      companyEmail: extractField(/Correo Electr[oó]nico:\s*(\S+@\S+\.\S+)/i, 'correo@no_encontrado.com'),
      documentReference: extractField(/Referencia para pagos[^:]*:\s*(\d+)/i, ''),
      issueDate: new Date(extractField(/Fecha y Hora:\s*(\d{2}\/\d{2}\/\d{4})/i) || '01/01/1970'),
      issueTime: extractField(/Fecha y Hora:\s*\d{2}\/\d{2}\/\d{4}\s*([\d:]+)/i, '00:00'),
      // Para los totales, en este ejemplo usamos el TOTAL (COP):
      totalFactura: parseFloat(extractField(/TOTAL \(COP\):\s*\$?\s*([\d,\.]+)/i, '0').replace(/,/g, '')),
      totalFacturaFormatted: parseFloat(extractField(/TOTAL \(COP\):\s*\$?\s*([\d,\.]+)/i, '0').replace(/,/g, '')),
      countries: [],
      // Sólo se guardan las propiedades que solicitas:
      descriptionsItem: invoiceItems.descriptionsItem,
      precioItem: invoiceItems.precioItem,
      precioItemFormatted: invoiceItems.precioItemFormatted,
      impuestoValorItem: invoiceItems.impuestoValorItem,
      impuestoValorItemFormatted: invoiceItems.impuestoValorItemFormatted,
      // Para el IVA, se extrae el valor numérico
      impuestoClaseItem: invoiceItems.impuestoClaseItem,
      // Quedan otros datos en blanco o asignados a un objeto auxiliar si lo requieres
      xml_anidado: { nitAdicional: nit }
    };
  }

  /**
   * Recorre el texto del PDF y extrae los valores relevantes de la tabla de ítems:
   * Para cada ítem se extrae:
   * - Descripción (por ejemplo, la segunda columna)
   * - Valor unitario (valor)
   * - IVA (valor)
   * Se asume un separador basado en 2 o más espacios.
   */
  private parseInvoiceItems(text: string): {
    descriptionsItem: string[];
    precioItem: number[];
    precioItemFormatted: number[];
    impuestoValorItem: number[];
    impuestoValorItemFormatted: number[];
    impuestoClaseItem: string[];
  } {
    const descriptionsItem: string[] = [];
    const precioItem: number[] = [];
    const precioItemFormatted: number[] = [];
    const impuestoValorItem: number[] = [];
    const impuestoValorItemFormatted: number[] = [];
    const impuestoClaseItem: string[] = [];

    // Separa el contenido en líneas
    const lines = text.split('\n');
    let captureItems = false;

    for (const line of lines) {
      // Activa la captura al detectar el encabezado de la tabla
      if (line.includes('CODIGO') && line.includes('DESCRIPCIÓN')) {
        captureItems = true;
        continue;
      }
      if (captureItems) {
        // Finaliza la captura cuando se detecta un resumen o línea en blanco
        if (line.trim() === '' || line.match(/(SUBTOTAL:|TOTAL \(COP\):)/i)) {
          break;
        }
        // Separa las columnas usando 2 o más espacios como separador
        const columns = line.trim().split(/\s{2,}/);
        if (columns.length >= 7) {
          // Suponemos que:
          // - La primera columna es el número o ítem (opcional)
          // - La segunda columna corresponde a la "Descripción"
          // - La cuarta columna es el "Valor Unitario" (valor)
          // - La séptima columna es el "IVA" (valor IVA)
          descriptionsItem.push(columns[1]);
          const valor = parseFloat(columns[3].replace(/,/g, ''));
          precioItem.push(valor);
          precioItemFormatted.push(valor);
          const ivaValor = parseFloat(columns[6].replace(/,/g, ''));
          impuestoValorItem.push(ivaValor);
          impuestoValorItemFormatted.push(ivaValor);
          // Asumimos que el impuesto siempre es IVA
          impuestoClaseItem.push("IVA");
        }
      }
    }

    return {
      descriptionsItem,
      precioItem,
      precioItemFormatted,
      impuestoValorItem,
      impuestoValorItemFormatted,
      impuestoClaseItem,
    };
  }

  private populateCompanyData(invoice: Invoice): Company {
    return {
      expanded: false,
      validated: 'pending',
      // Para el objeto Company, asignamos el nombre registrado en registrationName
      registrationName: invoice.cliente,
      // Usamos el total de la factura como totalBilledConverted (o ajusta según prefieras)
      totalBilledConverted: invoice.totalFactura,
      invoices: [invoice],
      id: invoice.id
    };
  }
}
