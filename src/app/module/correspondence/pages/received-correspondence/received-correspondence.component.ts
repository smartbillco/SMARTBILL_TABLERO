import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  NgbPaginationModule,
  NgbAlertModule,
  NgbTooltipModule,
} from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import {
  Attachment,
  CorrespondenceData,
  Sender,
} from "../../model/correspondence.model";
import { firstValueFrom, Subject } from "rxjs";
import { Router, RouterOutlet } from "@angular/router";
import { PanelComponent } from "../../../../components/panel/panel.component";
import moment from "moment";
import { CorrespondenceMetadataService } from "../../services/CorrespondenceMetadataService";
import { AttachmentsModalComponent } from "../attachments-modal/attachments-modal.component";
import { CorrespondenceUIService } from "../../services/correspondence-ui.service";
import { FilterService } from "../../services/filter.service";
import { CorrespondenceService } from "../../services/Correspondence.service";
import { NotificationService } from "../../../../pages/service/notification.service";
import { AppSettings } from "../../../../pages/service/app-settings.service";
import { DateRangePickerComponent } from "../../../../module/pages/date-range-picker/date-range-picker.component";

@Component({
  selector: "app-received-correspondence",
  standalone: true,
  imports: [
    CommonModule,
    NgbPaginationModule,
    NgbAlertModule,
    NgbTooltipModule,
    FormsModule,
    RouterOutlet,
    PanelComponent,
    AttachmentsModalComponent,
    DateRangePickerComponent,
  ],
  templateUrl: "./received-correspondence.component.html",
  styleUrls: ["./received-correspondence.component.scss"],
  host: {
    class: "h-100",
  },
})
export class ReceivedCorrespondenceComponent implements OnInit {
  // ========== PROPIEDADES DE FILTRO ==========
  searchTerm = "";
  selectedType: any = null;
  selectedStatus: any = null;
  selectedCategory: any = null;
  selectedDependence: any = null;
  dateselected = {
    startDate: moment("2024-01-01"),
    endDate: moment(),
  };

  // ========== PROPIEDADES DE SELECCIÓN Y ESTADO ==========
  selected: CorrespondenceData[] = [];
  selectedCorrespondence: CorrespondenceData | null = null;
  showAttachmentsModal = false;
  isLoading = true;

  // ========== PROPIEDADES DE DATOS ==========
  allRows: CorrespondenceData[] = [];
  filteredRows: CorrespondenceData[] = [];
  correspondences: CorrespondenceData[] = [];
  filteredCorrespondences: CorrespondenceData[] = [];
  senders: Sender[] = [];

  // ========== PAGINACIÓN Y ORDENAMIENTO ==========
  page = 1;
  pageSize = 5;
  searchText = "";
  currentSortField: string = "filingNumber";
  isSortAscending: boolean = true;

  // ========== VISIBILIDAD DE COLUMNAS ==========
  showFields = {
    filingNumber: true,
    filingDate: true,
    documentDate: false,
    externalFiling: false,
    senderName: true,
    subject: true,
    content: false,
    type: false,
    status: true,
    category: false,
    expiresInDays: false,
    dependence: true,
  };

  fieldOrder: string[] = [
    "filingNumber",
    "filingDate",
    "documentDate",
    "externalFiling",
    "senderName",
    "subject",
    "content",
    "type",
    "status",
    "category",
    "expiresInDays",
    "dependence",
  ];

  // ========== SUSCRIPCIONES ==========
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    public appSettings: AppSettings,
    private cd: ChangeDetectorRef,
    public uiService: CorrespondenceUIService,
    private filterService: FilterService,

    public correspondenceMetadataService: CorrespondenceMetadataService,
    public correspondenceService: CorrespondenceService
  ) {
    this.appSettings.appHeaderMegaMenu = true;
  }

  // ========== MÉTODOS DEL CICLO DE VIDA ==========
  async ngOnInit(): Promise<void> {
    this.loadColumnPreferences();
    await this.loadData();
    this.sortBy(this.currentSortField);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.appSettings.appHeaderMegaMenu = false;
  }

  // ========== MÉTODOS DE CARGA DE DATOS ==========
  private async loadData(): Promise<void> {
    try {
      const [correspondences, senders] = await Promise.all([
        firstValueFrom(this.correspondenceService.getAllCorrespondences()),
        firstValueFrom(this.correspondenceMetadataService.getSenders()),
      ]);

      await this.correspondenceMetadataService.loadAllMetadata();

      
      this.correspondences = correspondences;
      this.senders = senders;
      this.filteredCorrespondences = [...correspondences];
      this.isLoading = false;
    } catch (error) {
      console.error("Error loading data:", error);
      this.isLoading = false;
      this.notificationService.showError("Error al cargar los datos", "Error");
    }
  }

  // ========== MÉTODOS DE PREFERENCIAS DE COLUMNAS ==========
  private loadColumnPreferences(): void {
    const savedPrefs = localStorage.getItem("columnPreferences");
    if (savedPrefs) {
      this.showFields = JSON.parse(savedPrefs);
    }
  }

  saveColumnPreferences(): void {
    localStorage.setItem("columnPreferences", JSON.stringify(this.showFields));
  }

  // ========== MÉTODOS DE ORDENAMIENTO ==========
  sortBy(field: string): void {
    if (this.currentSortField === field) {
      this.isSortAscending = !this.isSortAscending;
    } else {
      this.currentSortField = field;
      this.isSortAscending = true;
    }
    this.filterCorrespondences();
  }

  private sortCorrespondences(): void {
    this.filteredCorrespondences.sort((a, b) => {
      const valueA = this.getFieldValue(a, this.currentSortField);
      const valueB = this.getFieldValue(b, this.currentSortField);

      // Manejar valores nulos/undefined
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return this.isSortAscending ? 1 : -1;
      if (valueB == null) return this.isSortAscending ? -1 : 1;

      // Manejar fechas
      if (valueA instanceof Date && valueB instanceof Date) {
        return this.isSortAscending
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }

      // Manejar números
      if (typeof valueA === "number" && typeof valueB === "number") {
        return this.isSortAscending ? valueA - valueB : valueB - valueA;
      }

      // Comparación por defecto de strings
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();

      return this.isSortAscending
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }

  private getFieldValue(item: CorrespondenceData, field: string): any {
    switch (field) {
      case "filingNumber":
        return item.filingNumber || "";
      case "filingDate":
        return item.filingDate ? new Date(item.filingDate) : null;
      case "documentDate":
        return item.documentDate ? new Date(item.documentDate) : null;
      case "externalFiling":
        return item.externalFiling || "";
      case "senderName":
        return this.getSenderFullName(item.senders?.idUser) || "";
      case "subject":
        return item.subject || "";
      case "content":
        return item.text || "";
      case "type":
        return item.correspondenceType?.descripcion || "";
      case "status":
        return item.documentStatus?.descripcion || "";

      case "expiresInDays":
        return item.correspondenceCategory?.expiresInDays ?? 0;
      case "category":
        return item.correspondenceCategory?.descripcion || "";

      case "dependence":
        return item.dependence?.descripcion || "";
      default:
        return "";
    }
  }

  // ========== MÉTODOS DE FILTRADO ==========
  filterCorrespondences(): void {

    this.filteredCorrespondences = this.filterService.filterCorrespondences(
      this.correspondences,
      this.searchText,
      this.senders,
      this.selectedType,
      this.selectedStatus,
      this.selectedCategory,
      this.selectedDependence,
      this.dateselected
    );

    this.sortCorrespondences();
    this.page = 1; // Reiniciar a la primera página al filtrar
  }

  clearAllFilters(): void {
    this.searchText = "";
    this.selectedType = null;
    this.selectedStatus = null;
    this.selectedCategory = null;
    this.selectedDependence = null;
    this.dateselected = {
      startDate: moment("2024-01-01"),
      endDate: moment(),
    };
    this.filterCorrespondences();
  }

  // ========== MÉTODOS AUXILIARES DE UI ==========
  get paginatedCorrespondences(): CorrespondenceData[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.filteredCorrespondences.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  getStatusClass(statusCode: number): string {
    const statusClasses: Record<number, string> = {
      1: "text-primary",
      2: "text-success",
      3: "text-secondary",
      4: "text-info",
      7: "text-warning",
      10: "text-danger",
      11: "text-primary",
    };
    return statusClasses[statusCode] || "text-dark";
  }

  getSenderFullName(idUser: number | undefined): string {
    if (!idUser) return "";
    const sender = this.senders.find((s) => s.idUser === idUser);
    return sender ? `${sender.firstName} ${sender.lastName}` : "";
  }

  // ========== MÉTODOS DE GESTIÓN DE COLUMNAS ==========
  toggleField(field: keyof typeof this.showFields): void {
    this.showFields[field] = !this.showFields[field];
    this.saveColumnPreferences();
  }

  getVisibleColumnsCount(): number {
    return Object.values(this.showFields).filter((val) => val).length + 1;
  }

  getFieldNames(): { key: string; label: string }[] {
    return [
      { key: "filingNumber", label: "N° Radicado" },
      { key: "filingDate", label: "Fecha Radicación" },
      { key: "documentDate", label: "Fecha Documento" },
      { key: "externalFiling", label: "Radicación Externa" },
      { key: "senderName", label: "Nombre Remitente" },
      { key: "subject", label: "Asunto" },
      { key: "content", label: "Contenido" },
      { key: "type", label: "Tipo" },
      { key: "status", label: "Estado" },
      { key: "category", label: "Categoría" },
      { key: "expiresInDays", label: "Días Expiración" },
      { key: "dependence", label: "Dependence" },
      { key: "correspondenceType", label: "Tipo Correspondencia" },
      { key: "documentStatus", label: "Estado Documento" },
      { key: "senders", label: "Remitente Completo" },
      { key: "attachments", label: "Archivos Adjuntos" },
    ].filter((item) => this.showFields.hasOwnProperty(item.key));
  }

  get allFieldsVisible(): boolean {
    return Object.values(this.showFields).every((val) => val);
  }

  toggleAllFields(): void {
    const newState = !this.allFieldsVisible;
    for (const key in this.showFields) {
      this.showFields[key] = newState;
    }
    this.saveColumnPreferences();
  }

  // ========== MANEJADORES DE EVENTOS ==========
  onDateRangeChange(e: {
    startDate: moment.Moment;
    endDate: moment.Moment;
  }): void {
    this.dateselected = e;
    this.filterCorrespondences();
  }

  selectType = (type: any) => {
    this.selectedType = type;
    this.filterCorrespondences();
  };

  selectStatus = (status: any) => {
    this.selectedStatus = status;
    this.filterCorrespondences();
  };

  selectCategory = (category: any) => {
    this.selectedCategory = category;
    this.filterCorrespondences();
  };

  selectDependence = (dependence: any) => {
    this.selectedDependence = dependence;
    this.filterCorrespondences();
  };

  // ========== ACCIONES DE CORRESPONDENCIA ==========
  addNewCorrespondence(): void {
    this.router.navigate(["/module/correspondence/received/new"]);
  }

  editCorrespondence(correspondence: CorrespondenceData): void {
    this.router.navigate([
      "/module/correspondence/received/edit",
      correspondence.filingNumber,
    ]);
  }

  onDeleteCorrespondence(filingNumber: string): void {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar el registro ${filingNumber}?`
      )
    ) {
      this.allRows = this.allRows.filter(
        (row) => row.filingNumber !== filingNumber
      );
      this.filterCorrespondences();
      this.notificationService.showSuccess(
        `Registro ${filingNumber} eliminado correctamente.`,
        "Eliminado"
      );
      this.cd.markForCheck();
    }
  }

  // ========== MÉTODOS DE ADJUNTOS ==========
  viewAttachments(correspondence: CorrespondenceData): void {
    this.selectedCorrespondence = correspondence;
    this.showAttachmentsModal = true;
    this.cd.markForCheck();
  }

  closeAttachmentsModal(): void {
    this.showAttachmentsModal = false;
    this.selectedCorrespondence = null;
    this.cd.markForCheck();
  }

  onAttachmentClicked(attachment: Attachment): void {
    if (attachment.fileUrl) {
      const link = document.createElement("a");
      link.href = attachment.fileUrl;
      link.target = "_blank";
      link.download = attachment.name || "documento";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // ========== MÉTODOS UTILITARIOS ==========
  printPage(): void {
    window.print();
  }
}
