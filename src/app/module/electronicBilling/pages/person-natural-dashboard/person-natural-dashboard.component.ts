import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HighlightModule } from "ngx-highlightjs";
import moment from "moment";
import { NgApexchartsModule } from "ng-apexcharts";
import { Company } from "../../model/company.model";
import { PanelComponent } from "../../../../components/panel/panel.component";
import { FilterInvoiceComponent } from "../../common/filter-invoice/filter-invoice.component";
import { CompanyCountryComponent } from "../../common/company-country/company-country.component";
import { CompanyInvoiceListComponent } from "../../common/company-invoice-list/company-invoice-list.component";
//import { ChartPdfService } from "../../../services/pdf/chart-pdf.service";
import { StatsComponent } from "../../common/stats/stats.component";
import { StakeComponent } from "../../common/stake/stake.component";
import { CharttaxComponent } from "../../common/chart-tax/charttax.component";
import { ActionDropdownComponent } from "../../common/action-dropdown/action-dropdown.component";
import { PdfExportService } from "../../services/pdf-export.service";
import { ChartPatternedComponent } from "../../common/chart-patterned/chart-patterned.component";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { CountryPositioningComponent } from "../../common/country-positioning/country-positioning.component";
import { ChatWindowComponent } from "../../common/chatbot/chat-window/chat-window.component";
import { FloatingChatbotButtonComponent } from "../../common/chatbot/floating-chatbot-button/floating-chatbot-button.component";
import { DateRangePickerComponent } from "../../../../module/pages/date-range-picker/date-range-picker.component";
import { AppSettings } from "../../../../pages/service/app-settings.service";
import { AppVariablesService } from "../../../../pages/service/app-variables.service";


@Component({
  selector: "app-person-natural",
  standalone: true,
  imports: [
    PanelComponent,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    HighlightModule,
    NgApexchartsModule,
    StatsComponent,
    FilterInvoiceComponent,
    StakeComponent,
    CompanyCountryComponent,
    CompanyInvoiceListComponent,
    FloatingChatbotButtonComponent,
    ChatWindowComponent,
    CharttaxComponent,
    ActionDropdownComponent,
    //SendWhatsappComponent,
    DateRangePickerComponent,
    CountryPositioningComponent,
    ChartPatternedComponent,
  ],
  //providers: [ChartPdfService],
  templateUrl: "./person-natural-dashboard.component.html",
  styleUrl: "./person-natural-dashboard.component.scss",
})
export class PersonNaturalDashboardComponent implements OnInit, OnDestroy {
  // Propiedad para el rango de fechas seleccionado
  dateselected: { startDate: moment.Moment; endDate: moment.Moment } = {
    startDate: moment("2016-01-01"), // 1 de enero de 2016
    endDate: moment(), // Fecha actual
  };

  // Método para manejar el cambio de fecha
  onDateRangeChange(e: {
    startDate: moment.Moment;
    endDate: moment.Moment;
  }): void {
    this.dateselected = e;
    //console.log("Rango de fechas seleccionado:", e);
  }

  //Variables graficas
  ChartbillingOptions: any = {};
  chartTaxOptions: any = {};

  appVariables = this.appVariablesService.getAppVariables();

  selectedCurrencyKey: string;
  allCompanies: Company[] = [];
  companiesData: Company[] = [];
  selectedCompany?: Company;
  selectedCountry: any;
  selectedPersonType = "Persona Natural";
  actionSelected = "compra";

  // Estilos
  backgroundColorClase = "bg-white";
  textoColorClase = "#000000";

  constructor(
    private appSettings: AppSettings,
    private appVariablesService: AppVariablesService,
    private cdr: ChangeDetectorRef,
    private pdfExportService: PdfExportService,
  ) {
    this.appVariablesService.variablesReload.subscribe(() => {
      this.appVariables = this.appVariablesService.getAppVariables();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.appSettings.appHeaderLanguageBar = true;
    }, 0);  // Esto retrasará el cambio al siguiente ciclo de eventos de Angular
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 500);
  }
  

  ngOnDestroy() {
    this.resetAppSettings();
  }

  private resetAppSettings(): void {
    this.appSettings.appHeaderLanguageBar = false;

    this.appSettings.appSidebarTransparent = false;
  }

  /*
  downloadChartsAsPDF() {
    this.pdfExportService.downloadChartsAsPDF('container'); 
  }*/
  downloadChartsAsPDF(): void {
    const element = document.getElementById("container");

    if (element) {
      html2canvas(element, {
        scale: 1, // Aumentar la escala para mejor calidad
        logging: false, // Desactivar logs en la consola
      } as any)
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png"); // Convertir el canvas a una imagen PNG

          // Configuración del PDF (tamaño oficio)
          const pdfWidth = 216; // Ancho del PDF en mm (tamaño oficio)
          const pdfHeight = 330; // Altura del PDF en mm (tamaño oficio)
          const imgWidth = pdfWidth - 20; // Ancho de la imagen en el PDF (con margen)
          const imgHeight = (canvas.height * imgWidth) / canvas.width; // Altura de la imagen proporcional

          // Centrar la imagen en el PDF
          const x = (pdfWidth - imgWidth) / 2; // Centrado en X
          const y = 10; // Margen superior

          // Obtener el país seleccionado y la fecha actual
          const countryName = this.selectedCountry
            ? this.selectedCountry.countryName
            : "Desconocido";
          const currentDate = moment().format("YYYY-MM-DD"); // Formato de fecha: Año-Mes-Día

          // Crear el nombre del archivo
          const fileName = `Dashboard_${countryName}_${currentDate}.pdf`;

          // Crear el PDF en tamaño oficio
          const pdf = new jsPDF("p", "mm", [pdfHeight, pdfWidth]); // Orientación vertical (portrait)
          pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight); // Agregar la imagen al PDF
          pdf.save(fileName); // Guardar el PDF con el nombre personalizado
        })
        .catch((error) => {
          console.error("Error al generar el PDF:", error);
        });
    } else {
      console.error("Elemento no encontrado");
    }
  }

  isChatOpen = false;

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    //console.log("Estado del chat cambiado:", this.isChatOpen);
  }

  onOriginalDataReceived(data: Company[]): void {
    this.allCompanies = data;
  }

  onCountrySelected(country: { countryId: string; countryName: string }): void {
    this.selectedCountry = country;
  }
  onCompaniesDataUpdated(data: Company[]): void {
    this.companiesData = data;
    this.cdr.detectChanges();
  }

  isTaxesVisible: boolean = false; // Por defecto, oculto

  toggleTaxesVisibility() {
    this.isTaxesVisible = !this.isTaxesVisible; // Alternar visibilidad
  }

}
