import { Component } from '@angular/core';
import { TextExtractService } from '../../services/text-extract.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-extract',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-extract.component.html',
  styleUrl: './text-extract.component.scss'
})
export class TextExtractComponent {
  selectedFile: File | null = null;

  extractedText: string[] = [];
  extractedDetails: { [key: string]: string } = {};
  rawText: string = '';
  error: string | null = null;
  loading: boolean = false;

  constructor(private textExtractService: TextExtractService) {}

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.clearResults();
  }

  private clearResults() {
    this.extractedText = [];
    this.extractedDetails = {};
    this.rawText = '';
    this.error = null;
  }

  extractFromImage() {
    if (!this.selectedFile) return;
    this.clearResults();
    this.loading = true;
    this.textExtractService.extractTextFromImage(this.selectedFile).subscribe({
      next: (res) => this.extractedText = res.data,
      error: () => this.error = 'Error al extraer texto de la imagen.',
      complete: () => this.loading = false
    });
  }

  extractFromPDF() {
    if (!this.selectedFile) return;
    this.clearResults();
    this.loading = true;
    this.textExtractService.extractTextFromPDF(this.selectedFile).subscribe({
      next: (res) => this.extractedText = res.data,
      error: () => this.error = 'Error al procesar el PDF.',
      complete: () => this.loading = false
    });
  }

  extractDetailsFromImage() {
    if (!this.selectedFile) return;
    this.clearResults();
    this.loading = true;
    this.textExtractService.extractDetailsFromImage(this.selectedFile).subscribe({
      next: (res) => this.extractedDetails = res.data,
      error: () => this.error = 'Error al extraer detalles de la imagen.',
      complete: () => this.loading = false
    });
  }

  extractDetailsFromPDF() {
    if (!this.selectedFile) return;
    this.clearResults();
    this.loading = true;
    this.textExtractService.extractDetailsFromPDF(this.selectedFile).subscribe({
      next: (res) => this.extractedDetails = res.data,
      error: () => this.error = 'Error al extraer detalles del PDF.',
      complete: () => this.loading = false
    });
  }


  
}
