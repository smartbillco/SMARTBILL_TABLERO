import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
} from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { getCountryDetails } from "../model/company.model";
import { AppSettingsConfig } from "../../../pages/service/appsettingsconfig";

@Injectable({
  providedIn: "root",
})
export class AppConfigurationService {
  private storageKey = "appSettingsConfig";
  private baseApiUrl = "https://v6.exchangerate-api.com/v6/";
  private apiKey = "a0e27ee39963d84f45004f61";
  private latestRatesEndpoint = "/latest/";
  private baseCurrency = "USD";
  private exchangeRateApiUrl = `${this.baseApiUrl}${this.apiKey}${this.latestRatesEndpoint}${this.baseCurrency}`;

  private cacheExpirationTime = 3600000; // 1 hora
  private lastCacheTimestamp = 0;

  private exchangeRatesSubject = new BehaviorSubject<Record<
    string,
    number
  > | null>(null);
  public exchangeRates$ = this.exchangeRatesSubject
    .asObservable()
    .pipe(shareReplay(1));

  private defaultConfig: AppSettingsConfig = {
    selectedCurrencyKey: "us",
    storageType: "servidor",
    selectedRepository: "amazon-aws-s3",
    rutaServidor: "C:/smartbill/uploads/",
    selectedLanguage: "Español",
    smsNotifications: true,
    emailNotifications: false,
    pushNotifications: false,
    tagsInput: [
      { value: "xml" },
      { value: "pdf" },
      { value: "png" },
      { value: "jpg" },
    ],
  };

  private settingsSubject = new BehaviorSubject<AppSettingsConfig>(
    this.loadConfigurationStore()
  );
  settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Cargar configuración desde localStorage o valores por defecto */
  private loadConfigurationStore(): AppSettingsConfig {
    try {
      const savedConfig = localStorage.getItem(this.storageKey);
      return savedConfig
        ? { ...this.defaultConfig, ...JSON.parse(savedConfig) }
        : { ...this.defaultConfig };
    } catch (error) {
      console.error("Error al parsear la configuración:", error);
      return { ...this.defaultConfig };
    }
  }

  /** Guardar configuración en localStorage */
  saveConfiguration(config: AppSettingsConfig): void {
    try {
      const currentConfig = this.settingsSubject.value;
      if (JSON.stringify(currentConfig) !== JSON.stringify(config)) {
        localStorage.setItem(this.storageKey, JSON.stringify(config));
        this.settingsSubject.next(config);
        console.log("Configuración guardada correctamente:", config);
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error);
    }
  }

  /** Actualizar configuración específica */
  updateSetting<T extends keyof AppSettingsConfig>(
    key: T,
    value: AppSettingsConfig[T]
  ): void {
    const currentConfig = this.settingsSubject.value;
    if (currentConfig[key] !== value) {
      this.saveConfiguration({ ...currentConfig, [key]: value });
    }
  }

  /** Obtener la configuración actual */
  getConfiguration(): AppSettingsConfig {
    return this.settingsSubject.value;
  }

  /** Restaurar configuración por defecto */
  resetToDefault(): void {
    this.saveConfiguration({ ...this.defaultConfig });
  }

  /** Enviar configuración al servidor */
  enviarConfiguracion(formData: any): Observable<any> {
    return this.http.post(
      `${environment.HOST_DATOS}/appsettingsconfig`,
      formData
    );
  }

  /** Obtener tasas de cambio almacenando en localStorage */
  public getExchangeRates(): Observable<Record<string, number>> {
    const savedRates = localStorage.getItem("exchangeRates");

    if (savedRates) {
      //console.log("✅ Usando tasas de cambio almacenadas en localStorage");
      this.exchangeRatesSubject.next(JSON.parse(savedRates));
      return of(JSON.parse(savedRates));
    }

    //console.log("🌐 Solicitando tasas de cambio desde la API");

    return this.http
      .get<{ conversion_rates: Record<string, number> }>(
        this.exchangeRateApiUrl
      )
      .pipe(
        tap((response) => {
          //console.log("🔄 Guardando tasas en localStorage:", response.conversion_rates );
          localStorage.setItem(
            "exchangeRates",
            JSON.stringify(response.conversion_rates)
          );
          this.exchangeRatesSubject.next(response.conversion_rates);
        }),
        map((response) => response.conversion_rates),
        catchError((error) => {
          console.error("❌ Error obteniendo tasas de cambio:", error);
          return of({});
        })
      );
  }

  /** Convertir moneda de origen a destino con moneda base */
  convertCurrencyExchangeRate(
    countryId: string,
    totalInLocalCurrency: number,
    targetCurrency: string,
    baseCurrency: string = "USD" // Se agrega baseCurrency con valor por defecto
  ): Observable<{ convertedAmount: number; exchangeRate: number }> {
    return this.getExchangeRates().pipe(
      switchMap((rates) => {
        const countryDetails = getCountryDetails(countryId);
        if (!countryDetails) {
          throw new Error(
            `No se encontraron detalles para el país con ID "${countryId}".`
          );
        }

        const localCurrency = countryDetails.rateKey;
        const baseRate = rates[baseCurrency];
        const localRate = rates[localCurrency];
        const targetRate = rates[targetCurrency];

        if (!baseRate || !localRate || !targetRate) {
          throw new Error(
            "No se encontraron las tasas de cambio para las monedas indicadas."
          );
        }

        // Convertir todo en relación con la moneda base
        const localToBaseRate = localRate / baseRate;
        const targetToBaseRate = targetRate / baseRate;
        const exchangeRate = targetToBaseRate / localToBaseRate;

        return of({
          convertedAmount: totalInLocalCurrency * exchangeRate,
          exchangeRate,
        });
      }),
      catchError((error) => {
        console.error("❌ Error obteniendo tasas de cambio:", error);
        return of({ convertedAmount: 0, exchangeRate: 1 }); // Valores por defecto en caso de error
      })
    );
  }

  /** Manejo centralizado de errores */
  private handleError<T>(message: string, result?: T): Observable<T> {
    console.error("❌ Error:", message);
    return of(result as T);
  }
}
