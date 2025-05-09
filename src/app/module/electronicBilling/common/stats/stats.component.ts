import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Company, COUNTRY_DETAILS } from "../../model/company.model";
import { Subject,takeUntil } from "rxjs";
import { CurrencyService } from "../../services/CurrencyService";

@Component({
  selector: "app-stats",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./stats.component.html",
  styleUrls: ["./stats.component.scss"],
})
export class StatsComponent implements OnChanges, OnDestroy {
  /** Para gestionar suscripciones y evitar fugas de memoria */
  private unsubscribe$ = new Subject<void>(); 
  @Input() selectedCountry: any = {};
  @Input() companiesData: Company[] = [];
  monedaObjetivo = "USD";
  symbol = "";
  
  backgroundColorClase = "bg-purple-200";
  textoColorClase = "#000000";

  totalImpuestos = 0;
  totalImpuestosPrincipal = 0; 
  totalImpuestosOtros = 0;
  NombreImpuestosprincipal = "";
  totalFacturadoConvertido = 0;
  granTotal = 0;

  constructor(
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en la moneda seleccionada
    this.currencyService.selectedCurrency$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((currency) => {
        this.monedaObjetivo = currency;
        this.updateCurrencySymbol();
        this.calculateTotals();

      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["companiesData"]) {
     
      if (!changes["companiesData"].firstChange) {
        this.updateCurrencySymbol();
        setTimeout(() => this.calculateTotals());
      }
    }
  }

  private updateCurrencySymbol(): void {
    const countryData = COUNTRY_DETAILS[this.monedaObjetivo];
    if (countryData) {
      this.monedaObjetivo = countryData.rateKey;
      this.symbol         = countryData.symbol;
    }
  }

  /** Se ejecuta cuando el componente se destruye para limpiar suscripciones */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private calculateTotals(): void {

    this.totalFacturadoConvertido = this.companiesData.reduce((acc, company) => {
      const total = Number(company.totalBilledConverted) || 0; // Asegurar que sea un número
      return acc + total;
    }, 0);
    
    this.totalImpuestos = this.calculateTotal(company => 
      company.invoices.reduce((sum, invoice) => sum + 
        invoice.impuestoValorItemFormatted.reduce((subtotal, value) => subtotal + (value ?? 0), 0), 0)
    );
    this.identifyMainAndOtherTaxes();
    
    // Calcula el gran total
    this.granTotal = this.totalImpuestosPrincipal + this.totalImpuestosOtros;
  }
  
  
  private calculateTotal(callback: (company: Company) => number): number {
    return this.companiesData.reduce((acc, company) => acc + callback(company), 0);
  }

  private identifyMainAndOtherTaxes(): void {
    const taxMap: Record<string, number> = {};

    this.companiesData.forEach(company => {
      company.invoices.forEach(invoice => {
        invoice.impuestoClaseItem.forEach((type, index) => {
          taxMap[type] = (taxMap[type] ?? 0) + (invoice.impuestoValorItemFormatted[index] ?? 0);
        });
      });
    });

    const [mainTaxType, mainTaxValue] = Object.entries(taxMap).reduce((max, entry) => 
      entry[1] > max[1] ? entry : max, ["", 0]
    );

    this.NombreImpuestosprincipal = mainTaxType;
    this.totalImpuestosPrincipal = mainTaxValue;
    this.totalImpuestosOtros = Object.values(taxMap).reduce((sum, value) => sum + value, 0) - mainTaxValue;
  }
}
