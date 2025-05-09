import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CurrencyService {
  private selectedCurrencySubject: BehaviorSubject<string>;
  selectedCurrency$; // Se inicializará en el constructor

  constructor() {
    // Cargar la configuración desde localStorage si existe
    const storedSettings = JSON.parse(localStorage.getItem("appSettingsConfig") || "{}");
    const initialCurrency = storedSettings.selectedCurrencyKey || "co"; // Valor por defecto

    // Inicializar el BehaviorSubject con el valor obtenido
    this.selectedCurrencySubject = new BehaviorSubject<string>(initialCurrency);

    // Asignar el observable después de inicializar selectedCurrencySubject
    this.selectedCurrency$ = this.selectedCurrencySubject.asObservable();
  }

  // Método para obtener el valor actual de la moneda
  getSelectedCurrency(): string {
    return this.selectedCurrencySubject.getValue();
  }

  // Método para actualizar la moneda y guardarla en localStorage
  updateCurrency(currency: string): void {
    this.selectedCurrencySubject.next(currency);

    // Guardar la nueva configuración en localStorage
    const storedSettings = JSON.parse(localStorage.getItem("appSettingsConfig") || "{}");
    storedSettings.selectedCurrencyKey = currency;
    localStorage.setItem("appSettingsConfig", JSON.stringify(storedSettings));
  }
}
