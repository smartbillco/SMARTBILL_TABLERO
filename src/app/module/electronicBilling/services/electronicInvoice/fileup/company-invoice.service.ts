import { Injectable } from '@angular/core';
import { Company, Invoice } from '../../../model/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyInvoiceService {
  private processedInvoices = new Set<string>();

  constructor() { }

  loadProcessedInvoices(companies: Company[]): void {
    this.processedInvoices = new Set(
      companies.flatMap(company =>
        company.invoices?.map(inv => inv.documentReference) || []
      )
    );
  }

  isInvoiceAlreadyProcessed(documentReferenceId: string): boolean {
    if (this.processedInvoices.has(documentReferenceId)) {
      return true;
    }
    return false;
  }

  addProcessedInvoice(documentReferenceId: string): void {
    this.processedInvoices.add(documentReferenceId);
  }

  // Función para agregar una factura a una compañía
  addInvoiceToCompany(invoiceData: any, companies: Company[]): { companies: Company[] } {
    const updatedCompanies = [...companies];

    const companyIndex = updatedCompanies.findIndex(
      (company) => company.registrationName === invoiceData.companyName
    );

    const invoice: Invoice = {
      expanded: false,
      id: invoiceData.customerId,
      cliente: invoiceData.customerName,
      documentReference: invoiceData.documentReferenceId,
      issueDate: invoiceData.issueDate,
      issueTime: invoiceData.issueTime,
      companyEmail: invoiceData.companyEmail,
      totalFactura: invoiceData.totalAmount,
      totalFacturaFormatted: 0,
      descriptionsItem: invoiceData.itemDescriptions,
      precioItem: invoiceData.itemPrices,
      precioItemFormatted: [0],
      impuestoClaseItem: invoiceData.itemTaxClasses,
      impuestoValorItem: invoiceData.itemTaxValues,
      impuestoValorItemFormatted: [0],
      xml_anidado: invoiceData.descriptionJson,
      countries: [
        {
          countryId: invoiceData.monedaId,
          name: invoiceData.monedaName,
          flag: invoiceData.monedaFlag,
          percentage: invoiceData.monedaPercentage,
          total: invoiceData.totalAmount,
          convertedTotal: invoiceData.convertedTotal,
          currencySymbol: invoiceData.monedaSymbol,
        },
      ],
    };

    if (companyIndex !== -1) {
      updatedCompanies[companyIndex].invoices.push(invoice);
    } else {
      updatedCompanies.push({
        id: invoiceData.companyId,
        registrationName: invoiceData.companyName,
        totalBilledConverted: 0,
        invoices: [invoice],
        expanded: false,
        validated: 'valid',
      });
    }

    return { companies: updatedCompanies };
  }


  // Función para marcar una compañía como inválida
  markCompanyAsInvalid(companies: Company[], registrationName: string): Company[] {
    const updatedCompanies = companies.map((company) => {
      if (company.registrationName === registrationName) {
        return { ...company, validated: 'invalid' as 'invalid' };
      }
      return company;
    });

    const companyExists = updatedCompanies.some(
      (company) => company.registrationName === registrationName
    );
    if (!companyExists) {
      updatedCompanies.push({
        expanded: false,
        validated: 'invalid' as 'invalid',
        id: `invalid-${Date.now()}`,
        registrationName: registrationName,
        totalBilledConverted: 0,
        invoices: [],
      });
    }

    return updatedCompanies;
  }
}