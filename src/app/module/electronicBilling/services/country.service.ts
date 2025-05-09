import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../model/company.model';
@Injectable({
  providedIn: 'root',
})
export class CountryService {
  constructor(private http: HttpClient) {}

  loadCountryList(): Observable<any> {
    return this.http.get<any>('assets/data/ui-language-bar-icon/code-1.json');
  }

  getCountryIconClass(countryCode: string): string {
    return `fi fi-${countryCode}`;
  }

  getCountryNames(companiesChart: Company[]): string {
    if (companiesChart.length > 0) {
      const invoice = companiesChart[0].invoices?.[0];
      const countries = invoice?.countries;
      if (countries && countries.length > 0) {
        return countries[0].name || "Sin país";
      }
    }
    return "Sin país";
  }

  getCountryId(companiesChart: Company[]): string {
    if (companiesChart.length > 0) {
      const invoice = companiesChart[0].invoices?.[0];
      const countries = invoice?.countries;
      if (countries && countries.length > 0) {
        return countries[0].countryId || "Sin ID";
      }
    }
    return "Sin ID";
  }

  fillCountryDetails(companiesChart: Company[]): void {
    const countryName = this.getCountryNames(companiesChart);
    const countryId = this.getCountryId(companiesChart);

    // Opcionalmente, puedes mostrar un mensaje o realizar otra acción:
    // alert(`El país seleccionado es: ${countryName} y su ID: ${countryId}`);
    console.log(`País seleccionado: ${countryName}, ID: ${countryId}`);
  }
}
