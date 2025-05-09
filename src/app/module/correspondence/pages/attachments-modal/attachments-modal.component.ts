import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CorrespondenceData, Attachment } from '../../model/correspondence.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attachments-modal',
  templateUrl: './attachments-modal.component.html',
  styleUrls: ['./attachments-modal.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AttachmentsModalComponent {
  @Input() isOpen = false;
  @Input() correspondence: CorrespondenceData | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() attachmentClicked = new EventEmitter<Attachment>();

  close(): void {
    this.closed.emit();
  }

  viewAttachment(attachment: Attachment): void {
    this.attachmentClicked.emit(attachment);
  }

  getFileIconClass(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    const iconMap: { [key: string]: string } = {
      pdf: 'bi-file-earmark-pdf text-danger',
      doc: 'bi-file-earmark-word text-primary',
      docx: 'bi-file-earmark-word text-primary',
      xls: 'bi-file-earmark-excel text-success',
      xlsx: 'bi-file-earmark-excel text-success',
      ppt: 'bi-file-earmark-ppt text-warning',
      pptx: 'bi-file-earmark-ppt text-warning',
      jpg: 'bi-file-earmark-image text-info',
      jpeg: 'bi-file-earmark-image text-info',
      png: 'bi-file-earmark-image text-info',
      gif: 'bi-file-earmark-image text-info',
      zip: 'bi-file-earmark-zip text-secondary',
      rar: 'bi-file-earmark-zip text-secondary',
      txt: 'bi-file-earmark-text text-dark',
      default: 'bi-file-earmark text-muted',
    };
    
    return 'bi ' + (iconMap[extension] || iconMap['default']);
  }
}