import { Injectable } from '@angular/core';
import { Company } from '../model/company.model';

@Injectable({
  providedIn: 'root'
})
export class FilterInvoiceService {

  constructor() {}

  /**
   * Aplica filtros a la lista de compañías.
   * @param companies Lista de compañías a filtrar.
   * @param filter Objeto que contiene los criterios de filtro.
   * @returns Lista filtrada de compañías.
   */
  applyFilter(
    companies: Company[], 
    filter: { name?: string; startDate?: Date; endDate?: Date; countryId?: string }
  ): Company[] {
    const startDate = filter.startDate ? new Date(filter.startDate) : null;
    const endDate = filter.endDate ? new Date(filter.endDate) : null;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999); // Asegura incluir facturas hasta el final del día.
    }

    return companies.map(company => {
      // Filtra las facturas por rango de fechas y countryId, si se proporcionan.
      const filteredInvoices = company.invoices.filter(invoice => 
        this.isDateInRange(new Date(invoice.issueDate), startDate, endDate) &&
        (!filter.countryId || invoice.countries.some(country => country.countryId === filter.countryId))
      );

      // Crear una copia de la compañía con facturas filtradas y total actualizado.
      const updatedCompany = { 
        ...company, 
        invoices: filteredInvoices, 
        totalFacturado: filteredInvoices.reduce((acc, invoice) => acc + invoice.totalFactura, 0)
      };

      // Filtra por nombre de la compañía, si se proporciona.
      return filteredInvoices.length > 0 &&
        (!filter.name || updatedCompany.registrationName.toLowerCase().includes(filter.name.toLowerCase()))
        ? updatedCompany
        : null;
    }).filter(company => company !== null) as Company[];
  }

  /**
   * Verifica si una fecha está dentro de un rango específico.
   * @param date Fecha a verificar.
   * @param startDate Fecha de inicio del rango (puede ser null).
   * @param endDate Fecha de fin del rango (puede ser null).
   * @returns Verdadero si la fecha está en el rango, falso de lo contrario.
   */
  private isDateInRange(date: Date, startDate: Date | null, endDate: Date | null): boolean {
    if (isNaN(date.getTime())) return false;
    const isAfterStartDate = startDate ? date >= startDate : true;
    const isBeforeEndDate = endDate ? date <= endDate : true;
    return isAfterStartDate && isBeforeEndDate;
  }
}
