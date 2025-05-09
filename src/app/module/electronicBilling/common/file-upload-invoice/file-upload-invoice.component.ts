import {
  Component,
  EventEmitter,
  Output,
  OnDestroy,
  OnInit,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { Subscription } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { Company } from "../../model/company.model";
import { FileUploadService } from "../../services/electronicInvoice/fileup/file-upload.service";
import { FileService } from "../../services/file.service";
import { LocalStorageService } from "../../services/electronicInvoice/fileup/LocalStorageService";
import { CompanyInvoiceService } from "../../services/electronicInvoice/fileup/company-invoice.service";
import { CommonModule } from "@angular/common";
import { NotificationService } from "./../../../../pages/service/notification.service";

declare var bootstrap: any;

@Component({
  selector: "app-file-upload-invoice",
  templateUrl: "./file-upload-invoice.component.html",
  styleUrls: ["./file-upload-invoice.component.css"],
  standalone: true,
  imports: [CommonModule],
})
export class FileUploadInvoiceComponent implements OnInit, OnDestroy, OnChanges {
  isDragOver = false;
  @Output() companiesData = new EventEmitter<Company[]>();
  @Input() clearDataEvent: boolean = false;

  selectedFiles: File[] = [];
  private readonly subscriptions = new Subscription();
  private companies: Company[] = [];

  // Variables para el modal de confirmación
  @ViewChild('confirmationModal') confirmationModal!: ElementRef;
  modalInstance: any;
  pendingFiles: File[] = [];
  isModalInitialized: boolean = false;

  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly fileService: FileService,
    private readonly localStorageService: LocalStorageService,
    private readonly companyInvoiceService: CompanyInvoiceService,
    private readonly toastr: ToastrService,
    private readonly notificationService: NotificationService,
  ) { }

  ngAfterViewInit(): void {
    this.initializeModal();
  }

  initializeModal(): void {
    if (this.confirmationModal?.nativeElement) {
      try {
        this.modalInstance = new bootstrap.Modal(this.confirmationModal.nativeElement, {
          backdrop: 'static',
          keyboard: false
        });
        this.isModalInitialized = true;
      } catch (error) {
        console.error('Error initializing modal:', error);
        this.isModalInitialized = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.modalInstance) {
      this.modalInstance.dispose();
    }
  }

  ngOnInit(): void {
    this.loadCompaniesFromLocalStorage();
  }

  ngOnChanges(): void {
    if (this.clearDataEvent) {
      this.clearData();
    }
  }

  clearData(): void {
    this.localStorageService.clearStoredCompanies();
    this.companies = [];
    this.selectedFiles = [];
    this.companyInvoiceService.loadProcessedInvoices([]);
    this.emitCompaniesData();
  }

  private emitCompaniesData(): void {
    this.companiesData.emit(this.companies);
  }

  private loadCompaniesFromLocalStorage(): void {
    this.companies = this.localStorageService.loadStoredCompanies();
    this.companyInvoiceService.loadProcessedInvoices(this.companies);
    this.emitCompaniesData();
  }

  async processFiles(files: FileList): Promise<void> {
    const fileList = Array.from(files).filter(this.isValidFile.bind(this));
    if (fileList.length === 0) return;

    // Mostrar modal de confirmación antes de proceder
    this.pendingFiles = fileList;
    if (this.isModalInitialized) {
      this.modalInstance.show();
    } else {
      console.error('Modal no está inicializado, procesando archivos directamente');
      this.processFilesAfterConfirmation(fileList, true);
    }
  }

  private isValidFile(file: File): boolean {
    const validExtensions = [".xml", ".zip"];
    const isValid = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isValid) {
      this.toastr.warning(
        `El archivo ${file.name} no es un archivo XML o ZIP válido`,
        "Advertencia"
      );
    }
    return isValid;
  }

  private updateCompanies(updatedCompanies: Company[]): void {
    this.companies = updatedCompanies;
    this.localStorageService.updateLocalStorage(this.companies);
    this.emitCompaniesData();
  }

  /*********************** Manejo de eventos de archivos *********************/
  onFileSelected(event: Event): void {
    this.fileUploadService.handleFileSelection(
      event,
      this.processFiles.bind(this)
    );
  }

  onDrop(event: DragEvent): void {
    this.fileUploadService.handleDrop(event, this.processFiles.bind(this));
  }

  onDragLeave(event: DragEvent): void {
    this.fileUploadService.handleDragLeave(event);
  }

  onDragOver(event: DragEvent): void {
    this.fileUploadService.handleDragOver(event);
  }

  /*********************** Manejo de confirmación *********************/
  onConfirmSave(decision: boolean): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }

    if (this.pendingFiles.length > 0) {
      this.processFilesAfterConfirmation(this.pendingFiles, decision);
      this.pendingFiles = [];
    }
  }

  private async processFilesAfterConfirmation(files: File[], saveToBackend: boolean): Promise<void> {
    let updatedCompanies = [...this.companies];
    const processedFiles: { file: File; status: "valid" | "invalid" }[] = [];
    const filesToUpload: File[] = [];

    const fileProcessingPromises = files.map(async (file) => {
      try {
        const xmlFiles = file.name.toLowerCase().endsWith(".zip")
          ? await this.fileUploadService.processZipFile(file)
          : [file];

        for (const xmlFile of xmlFiles) {
          const result = await this.fileUploadService.getInvoiceData(xmlFile);

          if (this.companyInvoiceService.isInvoiceAlreadyProcessed(result.documentReferenceId)) {
            processedFiles.push({ file: xmlFile, status: "invalid" });
            this.notificationService.showWarning(
              `Factura ${result.documentReferenceId} ya fue procesada`,
              "Advertencia"
            );
            continue;
          }

          await this.fileUploadService.processSingleXmlFile(
            xmlFile,
            processedFiles,
            updatedCompanies
          );
          this.companyInvoiceService.addProcessedInvoice(result.documentReferenceId);

          filesToUpload.push(xmlFile); // ✅ Guardamos para enviarlos juntos
        }
      } catch (error) {
        this.notificationService.showError(
          `Error procesando archivo ${file.name}: ${error.message}`
        );
      }
    });

    try {
      await Promise.all(fileProcessingPromises);
      this.updateCompanies(updatedCompanies);

      if (saveToBackend && filesToUpload.length > 0) {
        await this.saveFilesToBackend(filesToUpload); // ✅ Llamada única al backend
      }

    } catch (error) {
      this.notificationService.showError("Error general al procesar archivos");
    }
  }

  private async saveFilesToBackend(files: File[]): Promise<void> {
    try {
      const response = await this.fileService.uploadFiles(files).toPromise();

      if (response?.success) {
        console.log('Backend response:', response);
        const successMessages: string[] = [];
        const duplicateMessages: string[] = [];

        if (Array.isArray(response.data)) {
          response.data.forEach((msg: string) => {
            if (msg.toLowerCase().includes('duplicado')) {
              duplicateMessages.push(msg);
            } else {
              successMessages.push(msg);
            }
          });
        }

        if (successMessages.length > 0) {
          this.notificationService.showSuccess(
            `Subida exitosa de ${successMessages.length} archivo(s)`
          );
          successMessages.forEach(msg =>
            this.notificationService.showInfo(msg)
          );
        }

        if (duplicateMessages.length > 0) {
          this.notificationService.showWarning(
            `${duplicateMessages.length} archivo(s) ya estaban subidos`
          );
          duplicateMessages.forEach(msg =>
            this.notificationService.showWarning(msg)
          );
        }
      } else {
        const msg = response?.message || 'Desconocido';
        this.notificationService.showError(`Error al guardar archivos: ${msg}`);
      }
    } catch (error) {
      const errMsg = error?.error?.message || 'Desconocido';
      this.notificationService.showError(`Error al subir archivos: ${errMsg}`);
    }
  }


}