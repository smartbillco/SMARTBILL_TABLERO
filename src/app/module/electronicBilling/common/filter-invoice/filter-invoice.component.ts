import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectorRef,
} from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Observable, Subject, Subscription } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import moment from "moment";
import { CommonModule } from "@angular/common";
import { FileUploadInvoiceComponent } from "../file-upload-invoice/file-upload-invoice.component";
import {
  Company,
  Filter,
  COUNTRY_DETAILS,
} from "../../model/company.model";
import { FilterInvoiceService } from "../../services/filter-invoice.service";
import { CompanyCurrencyConversionService } from "../../services/CompanyCurrencyConversionService";
import { CountryService } from "../../services/country.service";
import { CurrencyService } from "../../services/CurrencyService";
import { SearchOptionsComponent } from "../search-options/search-options.component";
import { FileService } from "../../services/file.service";

@Component({
  selector: "app-filter-invoice",
  templateUrl: "./filter-invoice.component.html",
  styleUrls: ["./filter-invoice.component.css"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadInvoiceComponent,
    SearchOptionsComponent
  ],
})
export class FilterInvoiceComponent implements OnInit, OnChanges, OnDestroy {
  @Output() originalCompaniesData = new EventEmitter<Company[]>();
  @Output() companiesDataChanged = new EventEmitter<Company[]>();
  @Output() filterChanged = new EventEmitter<Filter>();
  @Output() countrySelected = new EventEmitter<{
    countryId: string;
    countryName: string;
  }>();

  @Input() dateselectedfilter!: {
    startDate: moment.Moment;
    endDate: moment.Moment;
  };

  @ViewChild(FileUploadInvoiceComponent)
  fileUploadComponent!: FileUploadInvoiceComponent;

  // Otras propiedades existentes
  clearDataEvent: boolean = false; // Nueva propiedad para controlar el evento de limpieza


  private currencySubscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();

  companiesBeforeFilter: Company[] = [];
  companiesData: Company[] = [];
  countries: any[] = [];
  selectedCountryId = "pe";
  selectedCountryName = "Peru";
  monedaObjetivo = "pe";
  baseCurrency = "USD";
  showSuggestions = false;
  companyNameControl = new FormControl<string | null>(null);
  startDateControl = new FormControl<string>("");
  endDateControl = new FormControl<string>("");
  filteredCompanies!: Observable<Company[]>;

  constructor(
    private countryService: CountryService,
    private currencyService: CurrencyService,
    private filterService: FilterInvoiceService,
    private currencyConversionService: CompanyCurrencyConversionService,
    private cdr: ChangeDetectorRef,
    private fileService: FileService

  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.companiesBeforeFilter.length > 0) {
        this.assignFirstAvailableCountry();
        this.applyFilter();
      }
    }, 1000);

    this.currencySubscription = this.currencyService.selectedCurrency$
      .pipe(takeUntil(this.destroy$))
      .subscribe((currency) => {
        this.monedaObjetivo = COUNTRY_DETAILS[currency]?.rateKey || currency;
        this.loadCountryList();
        this.onCountryChange({
          code: this.selectedCountryId,
          name: this.selectedCountryName,
        });

        if (this.companiesBeforeFilter.length > 0) {
          this.applyFilter();
        }
      });

    this.companyNameControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.applyFilter();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["dateselectedfilter"] &&
      changes["dateselectedfilter"].currentValue !==
      changes["dateselectedfilter"].previousValue
    ) {
      this.updateDateControls();
    }
  }

  applyFilter(): void {
    if (
      !this.companiesBeforeFilter ||
      this.companiesBeforeFilter.length === 0
    ) {
      return;
    }

    const filter: Filter = {
      name: this.companyNameControl.value?.trim() || undefined,
      startDate: this.startDateControl.value
        ? moment(this.startDateControl.value, "YYYY-MM-DD").toDate()
        : undefined,
      endDate: this.endDateControl.value
        ? moment(this.endDateControl.value, "YYYY-MM-DD").toDate()
        : undefined,
      countryId: this.selectedCountryId || undefined,
    };

    const filtered = this.filterService.applyFilter(
      this.companiesBeforeFilter,
      filter
    );


    this.currencyConversionService
      .calculateTotals(
        filtered,
        this.selectedCountryId,
        this.monedaObjetivo,
        this.baseCurrency
      )
      .subscribe((convertedData) => {
        if (
          JSON.stringify(convertedData) !== JSON.stringify(this.companiesData)
        ) {
          this.companiesData = convertedData;
          this.companiesDataChanged.emit([...convertedData]);
        }
      });
  }

  private updateDateControls(): void {
    if (this.dateselectedfilter) {
      this.startDateControl.setValue(
        this.dateselectedfilter.startDate.format("YYYY-MM-DD")
      );
      this.endDateControl.setValue(
        this.dateselectedfilter.endDate.format("YYYY-MM-DD")
      );
      this.applyFilter();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.currencySubscription.unsubscribe();
  }

  onCountryChange(country: { code: string; name: string }) {
    if (this.selectedCountryId !== country.code) {
      this.selectedCountryId = country.code;
      this.selectedCountryName = country.name;
      this.countrySelected.emit({
        countryId: this.selectedCountryId,
        countryName: this.selectedCountryName,
      });

      if (this.companiesBeforeFilter.length > 0) {
        this.applyFilter();
      }
    }
  }

  getCountryIconClass(countryCode: string): string {
    return this.countryService.getCountryIconClass(countryCode);
  }

  checkInput(value: string): void {
    this.showSuggestions = !!value;
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

  private assignFirstAvailableCountry(): void {
    if (this.companiesBeforeFilter.length > 0) {
      const firstCompany = this.companiesBeforeFilter[0];
      if (firstCompany.invoices?.length > 0) {
        const firstInvoice = firstCompany.invoices[0];
        if (firstInvoice.countries?.length > 0) {
          const firstCountry = firstInvoice.countries[0];

          this.selectedCountryId = firstCountry.countryId;
          this.selectedCountryName = firstCountry.name;

          //console.log("Selected Country ID:", this.selectedCountryId);
          //console.log("Selected Country Name:", this.selectedCountryName);

          this.countrySelected.emit({
            countryId: this.selectedCountryId,
            countryName: this.selectedCountryName,
          });
        }
      }
    }
  }

  clearFilter(): void {
    this.companyNameControl.setValue("");
    this.startDateControl.setValue("");
    this.endDateControl.setValue("");
    this.assignFirstAvailableCountry();
    this.applyFilter();
  }

  openConfirmationModal(): void {
    new (window as any).bootstrap.Modal(
      document.getElementById("filterConfirmationModal")
    ).show();
  }

  selectedCurrencyKey: string = "us"; // Valor predeterminado

  subscribeToClearCompanyList(): void {
    // Limpiar localStorage
    localStorage.clear();

    // Resetear variables locales
    this.companiesBeforeFilter = [];
    this.companiesData = [];
    this.countries = [];
    this.selectedCountryId = "pe";
    this.selectedCountryName = "Peru";
    this.monedaObjetivo = "pe";

    // Resetear controles de formulario
    this.companyNameControl.setValue("");
    this.startDateControl.setValue("");
    this.endDateControl.setValue("");

    // Emitir eventos vacíos para notificar el cambio
    this.originalCompaniesData.emit([]);
    this.companiesDataChanged.emit([]);
    this.filterChanged.emit({} as Filter);
    this.countrySelected.emit({
      countryId: this.selectedCountryId,
      countryName: this.selectedCountryName,
    });

    // Intentar cargar la configuración desde localStorage
    const storedSettings = JSON.parse(
      localStorage.getItem("appSettingsConfig") || "{}"
    );
    const initialCurrency =
      storedSettings.selectedCurrencyKey || this.selectedCurrencyKey;

    // Inicializar  con el valor obtenido o el valor predeterminado
    this.currencyService.updateCurrency(initialCurrency);
    // Activar el evento de limpieza en el componente hijo
    this.clearDataEvent = true; // Activar el evento
    setTimeout(() => {
      this.clearDataEvent = false; // Desactivar el evento después de un breve tiempo
    }, 100);

    //console.log("LocalStorage y datos reseteados.");
  }

  onFilesProcessed(files: Company[]): void {
    this.companiesBeforeFilter = [...files];
    this.originalCompaniesData.emit([...files]);

    this.assignFirstAvailableCountry();

    this.currencyConversionService
      .calculateTotals(
        files,
        this.selectedCountryId,
        this.monedaObjetivo,
        this.baseCurrency
      )
      .subscribe((convertedData) => {
        this.companiesData = convertedData;
        this.companiesDataChanged.emit([...convertedData]);
      });

    this.applyFilter();
  }

  onSearchOptionsChanged(selectedOptions: string[]) {
    //this.applyFilterWithOptions(selectedOptions);
  }

  exportToExcel() { }
  exportToPDF() { }


}