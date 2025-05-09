import { Injectable } from "@angular/core";
import { XMLInvoiceDataExtractorService } from "../PAN/InvoiceXmlDataExtractorService";
import { XmlHelper } from "../../xml-helper";

@Injectable({
  providedIn: "root",
})
export class XmlDataProcessorPAN {
  constructor(
    private invoiceProcessingService: XMLInvoiceDataExtractorService,
    private xmlHelper: XmlHelper
  ) {}

  public async processrContFeDocument(xmlDocument: Document): Promise<any> {
    try {
      // Convertir el documento XML a JSON solo una vez
      const xmlJson = await this.xmlHelper.convertXmlToJson(
        new XMLSerializer().serializeToString(xmlDocument)
      );

      // Extraer datos comunes del XML (sincronizado para evitar múltiples await)
      const invoiceData = this.extractCommonData(xmlDocument);
      //alert(`invoiceData: ${JSON.stringify(invoiceData, null, 2)}`);

      // Descripción del archivo (extraída una sola vez)
      const descriptionXmlString = this.xmlHelper.extractElementText(
        xmlDocument,
        "//rContFe"
      );

      invoiceData.descriptionJson = descriptionXmlString
        ? await this.xmlHelper.convertXmlToJson(descriptionXmlString)
        : {};

      // Extraer detalles de los ítems (función sincrónica mejorada)
      this.extractItemDetails(invoiceData, xmlJson);

      // Calcular el total del monto
      invoiceData.totalAmount = this.calculateTotalAmount(xmlJson);

      return invoiceData;
    } catch (error: unknown) {
      this.xmlHelper.handleError(
        error,
        "Error al procesar el documento de factura"
      );
      return null;
    }
  }

  private extractCommonData(xmlDoc: Document): any {
    const namespaceResolver = (prefix: string) => {
      const namespaces = {
        "": "http://dgi-fep.mef.gob.pa/wsdl/FeRecepFE", // Espacio de nombres por defecto
        rFE: "http://dgi-fep.mef.gob.pa", // Espacio de nombres del nodo rFE
      };
      return namespaces[prefix] || null;
    };

    const extract = (path: string): string => {
      try {
        const result = xmlDoc.evaluate(
          path,
          xmlDoc,
          namespaceResolver,
          XPathResult.STRING_TYPE,
          null
        );
        console.log(`XPath: ${path}, Valor extraído: ${result.stringValue}`);
        return result.stringValue || "";
      } catch (error) {
        console.error(`Error extrayendo XPath "${path}":`, error);
        return "";
      }
    };

    console.log("XML recibido:", new XMLSerializer().serializeToString(xmlDoc));

    return {
      monedaId: "pa",
      monedaName: "Panama",
      customerName: extract("//rFE:gDatRec/rFE:dNombRec"),
      customerId: extract("//rFE:gDatRec/rFE:dIdExt"),
      companyId: extract("//rFE:gEmis/rFE:dIdExt"),
      companyName: extract("//rFE:gEmis/rFE:dNombEm"),
      companyEmail:
        extract("//rFE:gEmis/rFE:dCorElectEmi") ||
        extract("//rFE:gDatRec/rFE:dCorElectRec"),
      documentReferenceId: extract("//rFE:dId"),
      issueDate: new Date(extract("//rFE:gDGen/rFE:dFechaEm")),
      issueTime: extract("//rFE:gDGen/rFE:dFechaEm"),
      totalAmount: parseFloat(extract("//rFE:gTot/rFE:dVTotItems") || "0"),
    };
  }

  private extractItemDetails(data: any, jsonContent: any): void {
    const variablesArray =
      this.xmlHelper.convertDescriptionToVariables(jsonContent);

    data.itemDescriptions = [];
    data.itemPrices = [];
    data.itemTaxClasses = [];
    data.itemTaxValues = [];

    //alert(JSON.stringify(variablesArray, null, 2));

    // Mejorar la eficiencia de las extracciones al hacerlas una sola vez
    this.invoiceProcessingService.extractDescriptions(
      variablesArray,
      data.itemDescriptions
    );

    this.invoiceProcessingService.extractPrices(
      variablesArray,
      data.itemPrices
    );
    this.invoiceProcessingService.extractTaxClasses(
      variablesArray,
      data.itemTaxClasses
    );
    this.invoiceProcessingService.extractTaxValues(
      variablesArray,
      data.itemTaxValues
    );
  }

  private calculateTotalAmount(xmlJson: any): number {
    const invoiceTotal = xmlJson?.["Invoice"]?.["cac:LegalMonetaryTotal"];

    const legalMonetaryTotal =
      xmlJson?.["rContFe"]?.["xFe"]?.["rFE"]?.["gTot"]?.["dVTot"];

    const creditNoteTotal = xmlJson?.["CreditNote"]?.["cac:LegalMonetaryTotal"];

    const amount =
      invoiceTotal?.["cbc:PayableAmount"] ??
      creditNoteTotal?.["cbc:PayableAmount"] ??
      parseFloat(legalMonetaryTotal || "0");

    if (amount !== undefined) {
      return parseFloat(amount);
    }

    console.error("No se encontró el valor total en el XML");
    throw new Error("No se encontró el valor total en el XML");
  }
}
