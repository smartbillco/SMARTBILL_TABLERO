import { Component, Input, OnInit, OnDestroy, SimpleChanges } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { NgScrollbar } from "ngx-scrollbar";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { Company, COUNTRY_DETAILS } from "../../model/company.model";
import { CurrencyService } from "../../services/CurrencyService";

@Component({
  selector: "app-company-country",
  standalone: true,
  providers: [DecimalPipe],
  imports: [CommonModule, NgScrollbar, FormsModule],
  templateUrl: "./company-country.component.html",
  styleUrls: ["./company-country.component.scss"],
})
export class CompanyCountryComponent implements OnInit, OnDestroy {
  /** Para gestionar suscripciones y evitar fugas de memoria */
  private unsubscribe$ = new Subject<void>(); 
  @Input() selectedCountry: any = {};
  @Input() companiesData: Company[] = [];
  monedaObjetivo = "USD";
  symbol = "";

  filterType: string = "highest";
  minFacturado: number = 0;
  maxFacturado: number = 3000000;

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    // Suscribirse a cambios en la moneda seleccionada
    this.currencyService.selectedCurrency$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((currency) => {
        this.monedaObjetivo = currency;
        this.updateCurrencySymbol();
      });
  }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes["companiesData"]) {
       
        if (!changes["companiesData"].firstChange) {
          this.updateCurrencySymbol();
          //setTimeout(() => this.calculateTotals());
        }
      }
    }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /** Actualiza el símbolo de la moneda seleccionada */
  private updateCurrencySymbol(): void {
    const countryData = COUNTRY_DETAILS[this.monedaObjetivo];
    if (countryData) {
      this.monedaObjetivo = countryData.rateKey;
      this.symbol         = countryData.symbol;
    }
  }


  /** Obtiene el total facturado en el país seleccionado por empresa */
  private getTotalFacturadoPorPais(company: Company): number {
    return company.invoices
      .filter((invoice) =>
        invoice.countries.some(
          (country) => country.name === this.selectedCountry.countryName
        )
      )
      .reduce((total, invoice) => total + invoice.totalFactura, 0);
  }

  /** Obtiene el total facturado en el país seleccionado */
  getTotalFacturado(): number {
    return this.companiesData.reduce(
      (total, company) => total + this.getTotalFacturadoPorPais(company),
      0
    );
  }

  /** Obtiene las 5 empresas con mayor facturación en el país seleccionado */
  getTopCompaniesByCountry(): Company[] {
    if (!this.selectedCountry?.countryName) return [];
    return this.companiesData
      .map((company) => ({
        ...company,
        totalFacturadoEnPais: this.getTotalFacturadoPorPais(company),
      }))
      .filter((company) => company.totalFacturadoEnPais > 0)
      .sort((a, b) => b.totalFacturadoEnPais - a.totalFacturadoEnPais)
      .slice(0, 5);
  }

  /** Obtiene las 5 empresas con menor facturación en el país seleccionado */
  getBottomCompaniesByCountry(): Company[] {
    if (!this.selectedCountry?.countryName) return [];
    return this.companiesData
      .map((company) => ({
        ...company,
        totalFacturadoEnPais: this.getTotalFacturadoPorPais(company),
      }))
      .filter((company) => company.totalFacturadoEnPais > 0)
      .sort((a, b) => a.totalFacturadoEnPais - b.totalFacturadoEnPais)
      .slice(0, 5);
  }

  /** Filtra empresas según el tipo de filtro (mayor o menor facturación) y rango personalizado */
  getCustomFilteredCompanies(
    filterType: string,
    minFacturado?: number,
    maxFacturado?: number
  ): Company[] {
    if (!this.selectedCountry?.countryName) return [];

    let filteredCompanies = this.companiesData
      .map((company) => ({
        ...company,
        totalFacturadoEnPais: this.getTotalFacturadoPorPais(company),
      }))
      .filter((company) => company.totalFacturadoEnPais > 0);

    if (minFacturado || maxFacturado) {
      filteredCompanies = filteredCompanies.filter((company) => {
        return (
          (minFacturado
            ? company.totalFacturadoEnPais >= minFacturado
            : true) &&
          (maxFacturado ? company.totalFacturadoEnPais <= maxFacturado : true)
        );
      });
    }

    return filteredCompanies
      .sort((a, b) =>
        filterType === "highest"
          ? b.totalFacturadoEnPais - a.totalFacturadoEnPais
          : a.totalFacturadoEnPais - b.totalFacturadoEnPais
      )
      .slice(0, 5);
  }

  /** Valida el valor máximo de facturación */
  validateMaxFacturado() {
    const regex = /^[0-9]+(\.[0-9]{1,2})? (COP|USD)$/;
    const maxFacturadoStr = this.maxFacturado?.toString() ?? "";

    if (!regex.test(maxFacturadoStr)) {
      console.log("El valor máximo no es válido.");
    }
  }

  /** Actualiza el estado de validación en el campo de entrada */
  onInputChange(minFacturadoInput) {
    minFacturadoInput.control.markAsTouched();
    minFacturadoInput.control.updateValueAndValidity();
  }
}
