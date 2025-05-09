import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FileUploadService } from './../../electronicInvoice/fileup/file-upload.service';
import { LocalStorageService } from './../../electronicInvoice/fileup/LocalStorageService';
import { CompanyInvoiceService } from './../../electronicInvoice/fileup/company-invoice.service';
import { Company } from '../../../model/company.model';

@Injectable({
  providedIn: 'root',
})
export class FileUploadManagerService {
  private companies: Company[] = [];

  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly localStorageService: LocalStorageService,
    private readonly companyInvoiceService: CompanyInvoiceService,
    private readonly toastr: ToastrService
  ) {}

  loadCompaniesFromLocalStorage(): Company[] {
    this.companies = this.localStorageService.loadStoredCompanies();
    this.companyInvoiceService.loadProcessedInvoices(this.companies);
    return this.companies;
  }

  clearData(): void {
    this.localStorageService.clearStoredCompanies();
    this.companies = [];
    this.companyInvoiceService.loadProcessedInvoices([]);
  }

  async processFiles(files: File[]): Promise<Company[]> {
    const fileList = files.filter(this.isValidFile.bind(this)); // Filtra archivos válidos
    if (fileList.length === 0) return this.companies;
  
    let updatedCompanies = [...this.companies];
    const processedFiles: { file: File; status: "valid" | "invalid" }[] = [];
  
    const fileProcessingPromises = fileList.map(async (file) => {
      const xmlFiles = file.name.toLowerCase().endsWith(".zip")
        ? await this.fileUploadService.processZipFile(file)
        : [file];
  
      for (const xmlFile of xmlFiles) {
        const result = await this.fileUploadService.getInvoiceData(xmlFile);
  
        if (this.companyInvoiceService.isInvoiceAlreadyProcessed(result.documentReferenceId)) {
          processedFiles.push({ file: xmlFile, status: "invalid" });
          return;
        }
  
        await this.fileUploadService.processSingleXmlFile(
          xmlFile,
          processedFiles,
          updatedCompanies
        );
        this.companyInvoiceService.addProcessedInvoice(result.documentReferenceId);
      }
    });
  
    await Promise.all(fileProcessingPromises);
    this.updateCompanies(updatedCompanies);
    return this.companies;
  }

  
  private isValidFile(file: File): boolean {
    const validExtensions = ['.xml', '.zip'];
    const isValid = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      this.toastr.warning(
        `El archivo ${file.name} no es un archivo XML o ZIP válido`,
        'Advertencia'
      );
    }
    return isValid;
  }

  private updateCompanies(updatedCompanies: Company[]): void {
    this.companies = updatedCompanies;
    this.localStorageService.updateLocalStorage(this.companies);
  }

  getCompanies(): Company[] {
    return this.companies;
  }
}