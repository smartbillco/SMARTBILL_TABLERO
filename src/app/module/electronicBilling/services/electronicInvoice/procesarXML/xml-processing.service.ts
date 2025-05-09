import { Injectable } from "@angular/core";
import { XmlHelper } from "./xml-helper";
import { XmlDataProcessorCOL } from "./PAIS/COL/xml-data-processor-colombia";
import { XmlDataProcessorPEN } from "./PAIS/PEN/xml-data-processor-peru";
import { XmlDataProcessorPAN } from "./PAIS/PAN/xml-data-processor-panama";

/**
 * Servicio encargado de procesar archivos XML, validarlos, convertirlos a JSON
 * y procesar su contenido dependiendo del tipo de documento.
 */
@Injectable({
  providedIn: "root",
})
export class XmlProcessingService {
  constructor(
    private xmlHelper: XmlHelper,
    private xmlDataProcessorCOL: XmlDataProcessorCOL,
    private xmlDataProcessorPEN: XmlDataProcessorPEN,
    private xmlDataProcessorPAN: XmlDataProcessorPAN,
  ) {}

  
  // Paso 1: Procesar el archivo XML
  async processFile(file: File): Promise<any> {
    try {
      // Paso 2: Leer el archivo como texto
      const fileContent = await this.xmlHelper.readFileAsText(file);
      
      // Paso 3: Parsear el contenido del archivo como XML
      const xmlDoc = new DOMParser().parseFromString(
        fileContent,
        "application/xml"
      );
      
      // Paso 4: Validar el XML
      this.xmlHelper.validateXml(xmlDoc);
      
      // Paso 5: Convertir el XML a una cadena y luego a JSON
      const xmlString = new XMLSerializer().serializeToString(xmlDoc);
      const xmlJson = await this.xmlHelper.convertXmlToJson(xmlString);

      // Paso 6: Verificar el tipo de documento para poder procesarlo
      if (xmlJson["AttachedDocument"]) {
        return this.xmlDataProcessorCOL.processAttachedDocument(xmlDoc);
        // Procesar como documento de Colombia
      }

      if (xmlJson["Invoice"]) {
        return this.xmlDataProcessorPEN.processInvoiceDocument(xmlDoc);
        // Procesar como documento de Perú 
      }

      if (xmlJson["rContFe"]) {
        return this.xmlDataProcessorPAN.processrContFeDocument(xmlDoc);
        // Procesar como documento de Panama
      }

      // Paso 7: Si no se encuentra un tipo válido, retornar datos vacíos
      alert(
        'La raíz del XML no esta tratada. Retornando datos vacíos.'
      );
      return this.xmlHelper.getEmptyData();
    } catch (error: unknown) {
      // Paso 8: Manejar errores
      this.xmlHelper.handleError(error, "Error al procesar el archivo XML");
    }
  }


}
