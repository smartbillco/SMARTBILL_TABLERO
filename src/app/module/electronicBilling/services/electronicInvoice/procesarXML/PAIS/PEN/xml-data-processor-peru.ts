import { Injectable } from "@angular/core";
import { XMLInvoiceDataExtractorService } from "../PEN/InvoiceXmlDataExtractorService";
import { XmlHelper } from "../../xml-helper";

@Injectable({
  providedIn: "root",
})
export class XmlDataProcessorPEN {
  constructor(
    private invoiceProcessingService: XMLInvoiceDataExtractorService,
    private xmlHelper: XmlHelper
  ) {}

  public async processInvoiceDocument(xmlDocument: Document): Promise<any> {
    try {
      // Convertir el documento XML a JSON solo una vez
      const xmlJson = await this.xmlHelper.convertXmlToJson(
        new XMLSerializer().serializeToString(xmlDocument)
      );

      // Extraer datos comunes del XML (sincronizado para evitar múltiples await)
      const invoiceData = this.extractCommonData(xmlDocument);

      // Descripción del archivo (extraída una sola vez)
      const descriptionXmlString = this.xmlHelper.extractElementText(
        xmlDocument,
        "//cac:Attachment/cac:ExternalReference/cbc:Description"
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
    const extract = (path: string) =>
      this.xmlHelper.extractElementText(xmlDoc, path) || "";

    return {
      monedaId: "pe",
      monedaName: "Peru",
      customerName:
        extract("//cac:AccountingCustomerParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName") ||
        extract("//cac:ReceiverParty/cac:PartyTaxScheme/cbc:RegistrationName"),
      customerId:
        extract("//cac:AccountingCustomerParty/cac:Party/cac:PartyLegalEntity/cbc:CompanyID") ||
        extract("//cac:ReceiverParty/cac:PartyTaxScheme/cbc:CompanyID") ||
        extract("//cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID"),
      companyId:
        extract("//cac:SenderParty/cac:PartyTaxScheme/cbc:CompanyID") ||
        extract("//cac:PartyTaxScheme/cbc:CompanyID"),
      companyName:
        extract("//cac:SenderParty/cac:PartyTaxScheme/cbc:RegistrationName") ||
        extract("//cac:PartyTaxScheme/cbc:RegistrationName") ||
        extract("//cac:PartyLegalEntity/cbc:RegistrationName"),
      companyEmail: extract("//cac:Party/cac:Contact/cbc:ElectronicMail"),
      documentReferenceId:
        extract("//cac:ParentDocumentLineReference/cac:DocumentReference/cbc:ID") || extract("//cbc:ID"),
      issueDate: new Date(extract("//cbc:IssueDate")),
      issueTime: extract("//cbc:IssueTime"),
      totalAmount: parseFloat(
        extract("//cac:LegalMonetaryTotal/cbc:PayableAmount") || "0"
      ),
    };
  }

  private extractItemDetails(data: any, jsonContent: any): void {
    const variablesArray =
      this.xmlHelper.convertDescriptionToVariables(jsonContent);

    data.itemDescriptions = [];
    data.itemPrices = [];
    data.itemTaxClasses = [];
    data.itemTaxValues = [];

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
    const creditNoteTotal = xmlJson?.["CreditNote"]?.["cac:LegalMonetaryTotal"];
    const amount =
      invoiceTotal?.["cbc:PayableAmount"] ??
      creditNoteTotal?.["cbc:PayableAmount"];

    if (amount !== undefined) {
      return parseFloat(amount);
    }

    console.error("No se encontró el valor total en el XML");
    throw new Error("No se encontró el valor total en el XML");
  }
}
