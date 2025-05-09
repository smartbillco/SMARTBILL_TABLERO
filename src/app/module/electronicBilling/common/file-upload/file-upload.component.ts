import { Modal } from 'bootstrap';
import { FileRequest } from "../../../../module/user-management/model/file-request.model";
import { Component, inject } from "@angular/core";
import { GroupedInvoiceResponse } from "../../../../module/user-management/model/grouped-invoice-response.model";
import { FileService } from "../../services/file.service";
import { ApiResponse } from "../../../../module/user-management/model/api-response.model";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-file-upload",
  templateUrl: "./file-upload.component.html",
  styleUrls: ["./file-upload.component.css"],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class FileUploadComponent {
  selectedFiles: File[] = [];
  fileType: string = "";
  searchResults: GroupedInvoiceResponse[] | FileRequest[] | null = null;
  isLoading = false;
  errorMessage = "";
  groupedFiles: any[] = [];
  message: string = '';
  loading: boolean = false;
  fileToDeleteId: number | null = null;
  fileToDeleteName = '';

  private toastr = inject(ToastrService);
  private fileService = inject(FileService);


  uploadFiles() {
    this.fileService.uploadFiles(this.selectedFiles).subscribe({
      next: res => {
        this.toastr.info(res.message, 'Arichivos procesados');
        if (res.data?.length > 0) {
          const duplicates = res.data.filter((msg: string) => msg.includes('duplicado') || msg.includes('omitido'));
          if (duplicates.length > 0) {
            this.toastr.warning(duplicates.join('\n'), 'Archivos duplicados');
          }
        }
      },
      error: () => this.toastr.error('Error al subir archivos', 'Error')
    });
  }

  searchFiles() {
    this.loading = true;
    this.fileService.searchFiles(this.fileType).subscribe({
      next: res => {
        this.groupedFiles = res.data;
        this.toastr.success(res.message, 'Búsqueda exitosa');
        this.loading = false;
      },
      error: () => {
        this.toastr.warning('No se encontraron archivos', 'Sin resultados');
        this.groupedFiles = [];
        this.loading = false;
      }
    });
  }

  deleteFile(id: number) {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este archivo?');
    if (!confirmed) return;

    this.fileService.deleteFile(id).subscribe({
      next: res => {
        this.toastr.success(res.message, 'Archivo eliminado');
        this.searchFiles(); // refrescar
      },
      error: () => this.toastr.error('Error al eliminar archivo', 'Error')
    });
  }

  confirmDelete(id: number, fileName: string): void {
    this.fileToDeleteId = id;
    this.fileToDeleteName = fileName;

    const modal = new Modal(document.getElementById('deleteModal')!);
    modal.show();
  }

  deleteConfirmed(): void {
    if (this.fileToDeleteId == null) return;

    this.fileService.deleteFile(this.fileToDeleteId).subscribe({
      next: res => {
        this.toastr.success(res.message, 'Archivo eliminado');
        this.searchFiles(); // refrescar
      },
      error: () => this.toastr.error('Error al eliminar archivo', 'Error')
    });

    // Resetear valores
    this.fileToDeleteId = null;
    this.fileToDeleteName = '';
  }

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  isGroupedResults(results: any): results is GroupedInvoiceResponse[] {
    return results && results[0] && results[0].invoiceCode !== undefined;
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
}