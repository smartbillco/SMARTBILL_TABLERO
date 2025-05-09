import { Injectable } from "@angular/core";
import { XMLInvoiceDataExtractorService } from "../COL/InvoiceXmlDataExtractorService";
import { XmlHelper } from "../../xml-helper";

@Injectable({
  providedIn: "root",
})
export class XmlDataProcessorCOL {
  constructor(
    private invoiceProcessingService: XMLInvoiceDataExtractorService,
    private xmlHelper: XmlHelper
  ) {}

  public async processAttachedDocument(xmlDocument: Document): Promise<any> {
    try {

      //alert(`invoiceData: ${JSON.stringify(xmlDocument, null, 2)}`);

      // Extraemos los datos comunes del documento XML (rama principal)
      const invoiceData = await this.extractCommonData(xmlDocument);

      // Extraer el texto de la descripción de la factura (como cadena XML)
      const invoiceDescriptionXmlString = this.extractElementText(
        xmlDocument,
        "//cac:Attachment/cac:ExternalReference/cbc:Description"
      );

      if (!invoiceDescriptionXmlString) {
        throw new Error("No se encontró la descripción en el XML.");
      }

      // Convertir la descripción XML a un documento XML para su procesamiento
      const descriptionXmlDoc = new DOMParser().parseFromString(
        invoiceDescriptionXmlString,
        "application/xml"
      );

      // Convertir la descripción XML a un objeto JSON para facilitar el manejo de datos
      const invoiceDescriptionJson = await this.xmlHelper.convertXmlToJson(
        invoiceDescriptionXmlString
      );
      
      invoiceData.descriptionJson = invoiceDescriptionJson;

      // Extraer detalles de los ítems de la factura
      this.extractItemDetails(invoiceData, invoiceDescriptionJson);

      // Calcular el monto total de la factura
      invoiceData.totalAmount = this.calculateTotalAmount(
        invoiceDescriptionJson
      );

      // Extraer el correo electrónico de la empresa del JSON
      invoiceData.companyEmail = this.extraerEmail(invoiceDescriptionJson);

      const invoice = invoiceDescriptionJson;

      // Obtener el correo electrónico del proveedor si está presente en el JSON
      const supplierEmail =
        invoice?.["cbc:AccountingSupplierParty"]?.["cbc:Party"]?.[
          "cbc:Contact"
        ]?.["cbc:ElectronicMail"];

      if (supplierEmail) {
        console.log(supplierEmail); // Imprime: "proveedor@example.com"
      } else {
        console.log("El campo cbc:ElectronicMail no se encuentra en el JSON.");
      }

      return invoiceData;
    } catch (error: unknown) {
      console.error(error); // Registrar el error en la consola
      this.xmlHelper.handleError(
        error,
        "Error al procesar el documento adjunto"
      );
    }
  }

  private async extractCommonData(xmlDoc: Document): Promise<any> {

    return {
      monedaId: "co",
      monedaName: "Colombia",
      customerName:
        this.extractElementText(
          xmlDoc,
          "//cac:AccountingCustomerParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName"
        ) ||
        this.extractElementText(
          xmlDoc,
          "//cac:ReceiverParty/cac:PartyTaxScheme/cbc:RegistrationName"
        ),
      customerId:
        this.extractElementText(
          xmlDoc,
          "//cac:AccountingCustomerParty/cac:Party/cac:PartyLegalEntity/cbc:CompanyID"
        ) ||
        this.extractElementText(
          xmlDoc,
          "//cac:ReceiverParty/cac:PartyTaxScheme/cbc:CompanyID"
        ) ||
        this.extractElementText(
          xmlDoc,
          "//cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID"
        ),
      companyId:
        this.extractElementText(
          xmlDoc,
          "//cac:SenderParty/cac:PartyTaxScheme/cbc:CompanyID"
        ) ||
        this.extractElementText(xmlDoc, "//cac:PartyTaxScheme/cbc:CompanyID"),
      companyName:
        this.extractElementText(
          xmlDoc,
          "//cac:SenderParty/cac:PartyTaxScheme/cbc:RegistrationName"
        ) ||
        this.extractElementText(
          xmlDoc,
          "//cac:PartyTaxScheme/cbc:RegistrationName"
        ) ||
        this.extractElementText(
          xmlDoc,
          "//cac:PartyLegalEntity/cbc:RegistrationName"
        ),
      companyEmail: this.extractElementText(
        xmlDoc,
        "//cac:Party/cac:Contact/cbc:ElectronicMail"
      ),
      documentReferenceId:
        this.extractElementText(
          xmlDoc,
          "//cac:ParentDocumentLineReference/cac:DocumentReference/cbc:ID"
        ) || this.extractElementText(xmlDoc, "//cbc:ID"),
      issueDate: new Date(this.extractElementText(xmlDoc, "//cbc:IssueDate")),
      issueTime: this.extractElementText(xmlDoc, "//cbc:IssueTime"),
      totalAmount: parseFloat(
        this.extractElementText(
          xmlDoc,
          "//cac:LegalMonetaryTotal/cbc:PayableAmount"
        ) || "0"
      ),
      //PriceAmount
    };
  }

  private extractItemDetails(data: any, jsonContent: any) {
    const variablesArray = this.convertDescriptionToVariables(jsonContent);

    const itemDescriptions: string[] = [];
    this.invoiceProcessingService.extractDescriptions(
      variablesArray,
      itemDescriptions
    );

    const itemPrices: number[] = [];
    this.invoiceProcessingService.extractPrices(variablesArray, itemPrices);

    const itemTaxClasses: string[] = [];
    this.invoiceProcessingService.extractTaxClasses(
      variablesArray,
      itemTaxClasses
    );

    const itemTaxValues: number[] = [];
    this.invoiceProcessingService.extractTaxValues(
      variablesArray,
      itemTaxValues
    );

    data.itemDescriptions = itemDescriptions;
    data.itemPrices = itemPrices;
    data.itemTaxClasses = itemTaxClasses;
    data.itemTaxValues = itemTaxValues;
  }

  private extraerEmail(xmlJson: any): string {
    const invoice = xmlJson?.["Invoice"];
    const accountingSupplierParty = invoice?.["cac:AccountingSupplierParty"];
    const party = accountingSupplierParty?.["cac:Party"];
    const contact = party?.["cac:Contact"];
    const email = contact?.["cbc:ElectronicMail"];

    if (email) {
      return email;
    } else {
      console.error("No se encontró el correo electrónico en el XML");
      return "Email no encontrado";
    }
  }

  private calculateTotalAmount(xmlJson: any): number {
    const invoice = xmlJson?.["Invoice"];
    const creditNote = xmlJson?.["CreditNote"];
    const invoiceTotal = invoice?.["cac:LegalMonetaryTotal"];
    const creditNoteTotal = creditNote?.["cac:LegalMonetaryTotal"];

    if (invoiceTotal?.["cbc:PayableAmount"] !== undefined) {
      return parseFloat(invoiceTotal["cbc:PayableAmount"]);
    } else if (creditNoteTotal?.["cbc:PayableAmount"] !== undefined) {
      return parseFloat(creditNoteTotal["cbc:PayableAmount"]);
    } else {
      console.error("No se encontró el valor total en el XML");
      throw new Error("No se encontró el valor total en el XML");
    }
  }

  public extractElementText(xmlDoc: Document, xpath: string): string {
    try {
      const resolver = xmlDoc.createNSResolver(xmlDoc.documentElement);
      const xpathResult = xmlDoc.evaluate(
        xpath,
        xmlDoc,
        resolver,
        XPathResult.STRING_TYPE,
        null
      );
      return xpathResult.stringValue.trim();
    } catch (error) {
      console.error(`Error al extraer el texto con XPath '${xpath}': ${error}`);
      return "";
    }
  }

  private convertDescriptionToVariables(descriptionJson: any): any[] {
    return Object.keys(descriptionJson).map((key) => ({
      key,
      value: descriptionJson[key],
    }));
  }
}

//alert(JSON.stringify(descriptionXmlString, null, 2));
