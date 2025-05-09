import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { NgScrollbarModule } from "ngx-scrollbar";
import { FormsModule } from "@angular/forms";
import { AudioService } from "../../../services/chatbot/audio.service";
import { ChatService } from "../../../services/chatbot/chatbot.service";
import { Company } from "../../../model/company.model";
import { FileUploadService } from "../../../services/electronicInvoice/fileup/file-upload.service";
import { LocalStorageService } from "../../../services/electronicInvoice/fileup/LocalStorageService";
import { CompanyInvoiceService } from "../../../services/electronicInvoice/fileup/company-invoice.service";
import { AppSettings } from "../../../../../pages/service/app-settings.service";

@Component({
  selector: "app-chat-window",
  templateUrl: "./chat-window.component.html",
  styleUrls: ["./chat-window.component.scss"],
  standalone: true,
  imports: [CommonModule, NgScrollbarModule, FormsModule],
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  @Input() toggleChat = false;
  @ViewChild("messagesContainer") private messagesContainer!: ElementRef;
  @ViewChild("fileInput") fileInput!: ElementRef;
  @Output() companiesData = new EventEmitter<Company[]>();

  isDragOver = false;
  isRecording = false;
  newMessage = "";
  selectedFiles: File[] = [];
  companies: Company[] = [];
  private subscriptions = new Subscription();

  messages$ = this.chatService.messages$;

  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly localStorageService: LocalStorageService,
    private readonly companyInvoiceService: CompanyInvoiceService,
    public appSettings: AppSettings,
    private readonly chatService: ChatService,
    private readonly toastr: ToastrService,
    private readonly audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.loadCompaniesFromLocalStorage();
    this.subscriptions.add(
      this.messages$.subscribe(() => setTimeout(() => this.scrollToBottom(), 100))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage, "user");
      this.newMessage = "";
      this.scrollToBottom();
    }
  }

  toggleRecording(): void {
    this.isRecording = !this.isRecording;
    this.isRecording ? this.audioService.startRecording() : this.audioService.stopRecording();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error("Error al desplazar el contenedor:", err);
      }
    }
  }

  private loadCompaniesFromLocalStorage(): void {
    this.companies = this.localStorageService.loadStoredCompanies();
    this.companyInvoiceService.loadProcessedInvoices(this.companies);
    this.emitCompaniesData();
  }

  clearData(): void {
    this.localStorageService.clearStoredCompanies();
    this.companies = [];
    this.companyInvoiceService.loadProcessedInvoices([]);
    this.emitCompaniesData();
  }

  async processFiles(files: FileList): Promise<void> {
    const fileList = Array.from(files).filter(this.isValidFile.bind(this));
    if (fileList.length === 0) return;

    let updatedCompanies = [...this.companies];

    const fileProcessingPromises = fileList.map(async (file) => {
      const xmlFiles = file.name.toLowerCase().endsWith(".zip")
        ? await this.fileUploadService.processZipFile(file)
        : [file];

      for (const xmlFile of xmlFiles) {
        const result = await this.fileUploadService.getInvoiceData(xmlFile);

        if (this.companyInvoiceService.isInvoiceAlreadyProcessed(result.documentReferenceId)) {
          //this.toastr.warning(`Factura duplicada: ${result.documentReferenceId}`, "Advertencia");
          return;
        }

        await this.fileUploadService.processSingleXmlFile(xmlFile, [], updatedCompanies);
        this.companyInvoiceService.addProcessedInvoice(result.documentReferenceId);

        this.chatService.uploadFile(xmlFile, "user").subscribe({
          next: () => this.chatService.sendMessage(`Archivo subido: ${xmlFile.name}`, "user"),
          error: () => this.chatService.sendMessage("Error al subir el archivo.", "bot"),
        });
      }
    });

    await Promise.all(fileProcessingPromises);
    this.updateCompanies(updatedCompanies);
  }

  private isValidFile(file: File): boolean {
    const validExtensions = [".xml", ".zip"];
    const isValid = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      this.toastr.warning(`El archivo ${file.name} no es un XML o ZIP válido`, "Advertencia");
    }
    return isValid;
  }

  private updateCompanies(updatedCompanies: Company[]): void {
    this.companies = updatedCompanies;
    this.localStorageService.updateLocalStorage(this.companies);
    this.emitCompaniesData();
  }

  private emitCompaniesData(): void {
    this.companiesData.emit(this.companies);
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.processFiles(event.target.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(files);
    }
  }
}