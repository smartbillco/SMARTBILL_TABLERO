import { Injectable } from "@angular/core";
import { Observable, forkJoin, of, from } from "rxjs";
import { map, catchError, mergeMap, toArray } from "rxjs/operators";
import { Company, Invoice } from "../model/company.model";
import { AppConfigurationService } from "./AppConfigurationService";
import { FilterInvoiceService } from "./filter-invoice.service";

@Injectable({
  providedIn: "root",
})
export class CompanyCurrencyConversionService {
  private readonly ERROR_CONVERSION = "Error en la conversión de moneda:";
  private readonly ERROR_PROCESAMIENTO_FACTURAS = "Error al procesar facturas de";

  constructor(private settingsService: AppConfigurationService) {}

  calculateTotals(
    companiesData: Company[],
    selectedCountryId: string,
    monedaObjetivo: string,
    baseCurrency: string
  ): Observable<Company[]> {
    // 🔍 Validar si companiesData está vacío
    if (!companiesData || companiesData.length === 0) {
      console.log("⚠️ companiesData está vacío. No hay empresas para procesar.");
      return of([]); // Retorna un Observable vacío para evitar errores.
    }

    // Procesar las empresas con los datos pasados como argumento
    return from(companiesData).pipe(
      mergeMap((company) =>
        this.processCompanyInvoices(company, selectedCountryId, monedaObjetivo, baseCurrency)
      ),
      toArray() // Convierte el flujo de empresas procesadas en un array
    );
  }

  private processCompanyInvoices(
    company: Company,
    selectedCountryId: string,
    monedaObjetivo: string,
    baseCurrency: string
  ): Observable<Company> {
    return forkJoin(
      company.invoices.map((invoice) =>
        this.convertInvoiceValues(invoice, selectedCountryId, monedaObjetivo, baseCurrency)
      )
    ).pipe(
      map((convertedInvoices) => {
        // Sumar todos los totalFacturaFormatted de las facturas convertidas
        const totalBilledConverted = convertedInvoices.reduce(
          (sum, invoice) => sum + (invoice.totalFacturaFormatted || 0),
          0
        );

        // Retornar la empresa con facturas convertidas y el totalBilledConverted actualizado
        return { ...company, invoices: convertedInvoices, totalBilledConverted };
      }),
      catchError((error) => {
        console.error(`${this.ERROR_PROCESAMIENTO_FACTURAS} ${company.registrationName}:`, error);
        return of({ ...company, totalBilledConverted: 0 }); // Si falla, asigna 0
      })
    );
  }

  private convertInvoiceValues(
    invoice: Invoice,
    selectedCountryId: string,
    monedaObjetivo: string,
    baseCurrency: string
  ): Observable<Invoice> {
    return forkJoin({
      // Convierte el total de la factura
      totalFacturaFormatted: this.convertCurrency(
        selectedCountryId,
        invoice.totalFactura,
        monedaObjetivo,
        baseCurrency
      ).pipe(catchError(() => of(0))), // Si falla, asigna 0
      // Convierte los precios de los ítems de la factura
      precioItemFormatted: this.convertArrayCurrency(
        selectedCountryId,
        invoice.precioItem ?? [],
        monedaObjetivo,
        baseCurrency
      ).pipe(catchError(() => of([]))), // Si falla, asigna un array vacío
      // Convierte los valores de los impuestos de los ítems de la factura
      impuestoValorItemFormatted: this.convertArrayCurrency(
        selectedCountryId,
        invoice.impuestoValorItem ?? [],
        monedaObjetivo,
        baseCurrency
      ).pipe(catchError(() => of([]))), // Si falla, asigna un array vacío
    }).pipe(
      // Retorna la factura con los valores convertidos
      map((converted) => ({ ...invoice, ...converted }))
    );
  }

  private convertCurrency(
    selectedCountryId: string,
    amount: number,
    monedaObjetivo: string,
    baseCurrency: string
  ): Observable<number> {
    // Si el monto es menor o igual a 0, no hay conversión y retorna 0
    if (amount <= 0) return of(0);

    // Llama al servicio para obtener la conversión de moneda
    return this.settingsService
      .convertCurrencyExchangeRate(selectedCountryId, amount, monedaObjetivo, baseCurrency)
      .pipe(
        // Extrae el monto convertido del resultado
        map((result) => (typeof result === "number" ? result : result?.convertedAmount ?? 0)),
        // Manejo de errores: si falla la conversión, retorna 0
        catchError((error) => {
          console.error(this.ERROR_CONVERSION, error);
          return of(0);
        })
      );
  }

  private convertArrayCurrency(
    selectedCountryId: string,
    amounts: number[],
    monedaObjetivo: string,
    baseCurrency: string
  ): Observable<number[]> {
    // Si la lista está vacía, retorna un array vacío sin realizar conversiones
    if (!amounts.length) return of([]);

    // Convierte cada monto individualmente y agrupa los resultados en un solo observable
    return forkJoin(
      amounts.map((amount) =>
        this.convertCurrency(selectedCountryId, amount, monedaObjetivo, baseCurrency)
      )
    ).pipe(
      // Manejo de errores: si alguna conversión falla, retorna un array con ceros en su lugar
      catchError((error) => {
        console.error(this.ERROR_CONVERSION, error);
        return of(new Array(amounts.length).fill(0));
      })
    );
  }
}
