import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { XmlProcessingService } from "../procesarXML/xml-processing.service";
import { CompanyInvoiceService } from "./company-invoice.service";
import {  unzip,  } from 'fflate';
import { Company } from "../../../model/company.model";

@Injectable({
  providedIn: "root",
})
export class FileUploadService {
  constructor(
    private xmlProcessingService: XmlProcessingService,
    private companyInvoiceService: CompanyInvoiceService,
    private toastr: ToastrService
  ) {}

  async processSingleXmlFile(
    file: File,
    processedFiles: { file: File; status: "valid" | "invalid" }[],
    companies: Company[]
  ): Promise<void> {
    try {
      const result = await this.xmlProcessingService.processFile(file);

      const updated = this.companyInvoiceService.addInvoiceToCompany(result, companies);
      companies.splice(0, companies.length, ...updated.companies);
      processedFiles.push({ file, status: "valid" });
    } catch (error) {
      this.handleError(file, error);
      const updated = this.companyInvoiceService.markCompanyAsInvalid(companies, file.name);
      companies.splice(0, companies.length, ...updated);
      processedFiles.push({ file, status: "invalid" });
    }
  }

  async processZipFile(file: File): Promise<File[]> {
    try {
      const zipData = await this.fileToUint8Array(file);
      const unzipped = await this.unzipFiles(zipData);
      return this.extractXmlFiles(unzipped);
    } catch (error) {
      this.handleError(file, error);
      return []; // Devuelve un array vacío en caso de error
    }
  }

  async unzipFiles(zippedData: Uint8Array): Promise<{ [filename: string]: Uint8Array }> {
    return new Promise((resolve, reject) => {
      unzip(zippedData, (err, unzipped) => {
        if (err) {
          reject(err);
        } else {
          resolve(unzipped);
        }
      });
    });
  }

  extractXmlFiles(unzipped: { [filename: string]: Uint8Array }): File[] {
    const xmlFiles: File[] = [];
    for (const [relativePath, fileData] of Object.entries(unzipped)) {
      if (relativePath.toLowerCase().endsWith(".xml")) {
        try {
          const xmlFile = new File([fileData], relativePath, { type: "application/xml" });
          xmlFiles.push(xmlFile);
        } catch (error) {
          this.toastr.error(
            `Error al extraer el archivo ${relativePath} del ZIP`,
            "Error"
          );
        }
      }
    }
    return xmlFiles;
  }

  async fileToUint8Array(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(reader.result));
        } else {
          reject(new Error('No se pudo leer el archivo.'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  handleError(file: File, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.toastr.error(
      `Error procesando el archivo ${file.name}: ${errorMessage}`,
      "Error"
    );
  }

  handleFileSelection(
    event: any,
    processFiles: (files: FileList) => void
  ): void {
    if (event.target.files.length > 0) {
      processFiles(event.target.files);
    }
  }

  handleDrop(event: DragEvent, processFiles: (files: FileList) => void): void {
    event.preventDefault();
    event.stopPropagation();
    this.setDragOver(event, false);
    if (event.dataTransfer?.files.length) {
      processFiles(event.dataTransfer.files);
    }
  }

  handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.setDragOver(event, false);
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.setDragOver(event, true);
  }

  private setDragOver(event: DragEvent, isOver: boolean): void {
    (event.target as HTMLElement).classList.toggle("dragover", isOver);
  }

  async getInvoiceData(file: File): Promise<{ companyName: string; documentReferenceId: string }> {
    const result = await this.xmlProcessingService.processFile(file);
    return {
      companyName: result.companyName,
      documentReferenceId: result.documentReferenceId,
    };
  }
}