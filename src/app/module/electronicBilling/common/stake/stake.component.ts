import { Component, Input, SimpleChanges, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import {
  Company,
  Country,
  COUNTRY_DETAILS,
  getCountryDetails,
} from "../../model/company.model";
import { AppConfigurationService } from "../../services/AppConfigurationService";
import { CountryService } from "../../services/country.service";

@Component({
  selector: "app-stake",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./stake.component.html",
  styleUrls: ["./stake.component.scss"],
})
export class StakeComponent implements OnDestroy {
  @Input() companiesDataStake: Company[] = [];

  countries: Country[] = [];
  exchangeRates: { [key: string]: number } = {};
  private exchangeRatesLoaded = false;

  // Asigna COUNTRY_DETAILS a una propiedad pública
  public countryDetails = COUNTRY_DETAILS;

  // Variable para almacenar el índice actual del exchange rate
  private currentExchangeRateIndex = 0;
  private exchangeRateInterval: any;

  // Variable para almacenar el exchange rate actual
  public currentExchangeRate: {
    countryCode: string;
    currency: string;
    rate: number;
    symbol: string;
  } = {
    countryCode: '',
    currency: '',
    rate: 0,
    symbol: '',
  };

  constructor(
    private exchangeRateService: AppConfigurationService,
    private countryService: CountryService,
  ) {}

  ngOnInit() {
    if (!this.exchangeRatesLoaded) {
      this.loadExchangeRates();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["companiesDataStake"] &&
      !changes["companiesDataStake"].isFirstChange() &&
      this.exchangeRatesLoaded
    ) {
      this.generateCountriesData();
    }
  }

  ngOnDestroy() {
    if (this.exchangeRateInterval) {
      clearInterval(this.exchangeRateInterval);
    }
  }

  private loadExchangeRates() {
    if (this.exchangeRatesLoaded) {
      return; // No carga de nuevo si ya está cargada
    }
    this.exchangeRateService.getExchangeRates().subscribe(
      (rates) => {
        this.exchangeRates = {
          COP: rates['COP'],
          PAB: 1, // PAB es la moneda base, por lo que su tasa es 1
          PEN: rates['PEN'],
          USD: 1, // USD es la moneda base, por lo que su tasa es 1
        };
        this.exchangeRatesLoaded = true;
        if (this.companiesDataStake.length) {
          this.generateCountriesData();
        }
        this.startExchangeRateRotation();
      },
      (error) => {
        console.error("Error al cargar las tasas de cambio:", error);
      }
    );
  }

  private startExchangeRateRotation() {
    const exchangeRatesList = [
      { countryCode: 'co', currency: 'COP', rate: this.exchangeRates['COP'], symbol: this.countryDetails['co']?.symbol },
      { countryCode: 'pe', currency: 'PEN', rate: this.exchangeRates['PEN'], symbol: this.countryDetails['pe']?.symbol },
      { countryCode: 'pa', currency: 'PAB', rate: this.exchangeRates['PAB'], symbol: this.countryDetails['pa']?.symbol },
    ];

    // Inicializa el primer exchange rate
    this.currentExchangeRate = exchangeRatesList[this.currentExchangeRateIndex];

    // Cambia el exchange rate cada 3 segundos
    this.exchangeRateInterval = setInterval(() => {
      this.currentExchangeRateIndex = (this.currentExchangeRateIndex + 1) % exchangeRatesList.length;
      this.currentExchangeRate = exchangeRatesList[this.currentExchangeRateIndex];
    }, 3000); // Cambia cada 3 segundos
  }

  // Método para mostrar el siguiente exchange rate manualmente
  showNextExchangeRate() {
    const exchangeRatesList = [
      { countryCode: 'co', currency: 'COP', rate: this.exchangeRates['COP'], symbol: this.countryDetails['co']?.symbol },
      { countryCode: 'pe', currency: 'PEN', rate: this.exchangeRates['PEN'], symbol: this.countryDetails['pe']?.symbol },
      { countryCode: 'pa', currency: 'PAB', rate: this.exchangeRates['PAB'], symbol: this.countryDetails['pa']?.symbol },
    ];

    this.currentExchangeRateIndex = (this.currentExchangeRateIndex + 1) % exchangeRatesList.length;
    this.currentExchangeRate = exchangeRatesList[this.currentExchangeRateIndex];
  }

  private generateCountriesData() {
    const countryData: { [key: string]: { flag: string; total: number } } = {};

    this.companiesDataStake.forEach((company) => {
      company.invoices?.forEach((invoice) => {
        const countryId =
          Array.isArray(invoice.countries) && invoice.countries.length > 0
            ? invoice.countries[0]?.countryId
            : undefined;

        if (countryId && invoice.totalFactura) {
          const currentData = countryData[countryId] || {
            flag: countryId,
            total: 0,
          };
          currentData.total += invoice.totalFactura;
          countryData[countryId] = currentData;
        }
      });
    });

    const totalFacturadoUSD = Object.values(countryData).reduce(
      (sum, data) => sum + this.convertToUSD(data.flag, data.total),
      0
    );

    this.countries = Object.entries(countryData).map(([countryId, data]) => {
      const countryDetails = getCountryDetails(countryId);
      const totalInLocalCurrency = data.total;
      const convertedTotal = this.convertToUSD(countryId, totalInLocalCurrency);

      return {
        countryId,
        name: countryDetails?.name || countryId,
        flag: data.flag,
        total: totalInLocalCurrency,
        percentage:
          totalFacturadoUSD > 0
            ? (convertedTotal / totalFacturadoUSD) * 100
            : 0,
        convertedTotal,
        currencySymbol: countryDetails?.symbol || "",
      };
    });
  }

  private convertToUSD(countryId: string, totalInLocalCurrency: number): number {
    const countryDetails = getCountryDetails(countryId);
    if (countryDetails?.rateKey && this.exchangeRates[countryDetails.rateKey]) {
      return totalInLocalCurrency / this.exchangeRates[countryDetails.rateKey];
    }
    return totalInLocalCurrency;
  }

  getCountryIconClass(countryCode: string): string {
    return this.countryService.getCountryIconClass(countryCode);
  }

  // Método para mostrar COUNTRY_DETAILS en un alert
  showCountryDetails() {
    alert(JSON.stringify(COUNTRY_DETAILS, null, 2));
  }
}