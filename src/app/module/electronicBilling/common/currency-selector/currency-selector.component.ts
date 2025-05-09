import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { COUNTRY_DETAILS } from "../../model/company.model";
import { CurrencyService } from "../../services/CurrencyService";
import { CountryService } from "../../services/country.service";

@Component({
  selector: "app-currency-selector",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./currency-selector.component.html",
  styleUrl: "./currency-selector.component.scss",
})
export class CurrencySelectorComponent implements OnInit {
  settingsForm: FormGroup;
  countryKeys: string[] = [];
  countries: any[] = [];

  COUNTRY_DETAILS = COUNTRY_DETAILS;
  selectedCurrencyKey: string = "us"; // Valor predeterminado

  constructor(
    private fb: FormBuilder,
    private currencyService: CurrencyService,
    private cdr: ChangeDetectorRef,
    private countryService: CountryService
  ) {
    // Intentar cargar la configuración desde localStorage
    const storedSettings = JSON.parse(
      localStorage.getItem("appSettingsConfig") || "{}"
    );
    const initialCurrency =
      storedSettings.selectedCurrencyKey || this.selectedCurrencyKey;

    // Inicializar  con el valor obtenido o el valor predeterminado
    this.currencyService.updateCurrency(initialCurrency);
  }

  ngOnInit(): void {
    this.countryKeys = Object.keys(this.COUNTRY_DETAILS);

    // Cargar la configuración desde localStorage si existe
    const storedSettings = JSON.parse(
      localStorage.getItem("appSettingsConfig") || "{}"
    );
    if (storedSettings.selectedCurrencyKey) {
      this.selectedCurrencyKey = storedSettings.selectedCurrencyKey;
    }

    this.settingsForm = this.fb.group({
      selectedCurrencyKey: [this.selectedCurrencyKey],
    });

    this.settingsForm
      .get("selectedCurrencyKey")
      ?.valueChanges.subscribe((value) => {
        this.onCurrencyChanged(value);
      });

    this.loadCountryList();
  }

  // Método para manejar el cambio de moneda y guardar en localStorage
  onCurrencyChanged(selectedCurrency: string): void {
    this.selectedCurrencyKey = selectedCurrency;
    this.currencyService.updateCurrency(selectedCurrency); // Actualiza el servicio

    // Guardar en localStorage
    const appSettings = JSON.parse(
      localStorage.getItem("appSettingsConfig") || "{}"
    );
    appSettings.selectedCurrencyKey = selectedCurrency;
    localStorage.setItem("appSettingsConfig", JSON.stringify(appSettings));

    //console.log('Moneda seleccionada y guardada en localStorage:', selectedCurrency);
    this.cdr.detectChanges(); // Detectar cambios en la vista si es necesario
  }

  private loadCountryList(): void {
    this.countryService.loadCountryList().subscribe({
      next: (response) => {
        this.countries = response?.countries || [];
      },
      error: (error) => {
        console.error("Error al cargar países:", error);
      },
    });
  }

  getCountryIconClass(countryCode: string): string {
    return this.countryService.getCountryIconClass(countryCode);
  }

  dropdownOpen = false;

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectCurrency(key: string): void {
    this.selectedCurrencyKey = key;
    //this.updateCurrency(key);
    this.dropdownOpen = false;
  } 
}
