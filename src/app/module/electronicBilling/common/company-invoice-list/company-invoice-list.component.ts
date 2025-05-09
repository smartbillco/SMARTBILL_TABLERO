import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ModalService } from "../../services/modal.service";
import { Company, COUNTRY_DETAILS } from "../../model/company.model";
import { CurrencyService } from "../../services/CurrencyService";

@Component({
  selector: "app-company-invoice-list",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./company-invoice-list.component.html",
  styleUrls: ["./company-invoice-list.component.scss"],
})
export class CompanyInvoiceListComponent implements OnInit, OnDestroy {
  /** Para gestionar suscripciones y evitar fugas de memoria */
  private unsubscribe$ = new Subject<void>();
  @Input() selectedCountry: any = {};
  @Input() companiesData: Company[] = [];
  monedaObjetivo = "USD";
  symbol = "";

  /** Archivo y factura seleccionados en la interfaz */
  selectedFile: any;
  selectedInvoice: any;

  constructor(
    private modalService: ModalService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en la moneda seleccionada
    this.currencyService.selectedCurrency$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((currency) => {
        this.monedaObjetivo = currency;
        this.updateCurrencySymbol();
      });

    // Suscribirse al archivo seleccionado para el modal
    this.modalService.selectedFile$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((file) => {
        this.selectedFile = file;
      });

    // Suscribirse a la factura seleccionada para el modal
    this.modalService.selectedInvoice$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((invoice) => {
        this.selectedInvoice = invoice;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["companiesData"]) {
      this.updateCurrencySymbol();
    }
  }

  /** Actualiza el símbolo de la moneda seleccionada */
  private updateCurrencySymbol(): void {
    const countryData = COUNTRY_DETAILS[this.monedaObjetivo];
    if (countryData) {
      this.monedaObjetivo = countryData.rateKey;
      this.symbol = countryData.symbol;
    }
  }

  /** Exporta los datos a Excel o PDF */
  exportData(): void {
    alert("Exportando a Excel o PDF");
  }

  /** Se ejecuta cuando el componente se destruye para limpiar suscripciones */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /** Abre el modal de archivos para la empresa seleccionada */
  openFileModal(company: Company): void {
    this.modalService.openFileModal(company);
    console.log('selectedFile:', this.selectedFile);
  }

  /** Abre el modal de detalles de la factura seleccionada */
  openInvoiceDetailsModal(invoice: any): void {
    this.modalService.openInvoiceDetailsModal(invoice);
  }

  /** Visualiza los detalles de la factura */
  viewInvoiceDetails(invoice: any): void {
    this.modalService.viewInvoiceDetails(invoice);
  }

  /** Limpia los datos de la lista de empresas */
  clearCompanyList(): void {}
}
